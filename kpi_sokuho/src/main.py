from __future__ import annotations

import asyncio
import logging
import sys
from logging.handlers import RotatingFileHandler

from config import load_config
from ctstage import ctstage_session
from parse import parse_call_or_group_daily, parse_incom_15min, parse_op_daily
from store import Store

log = logging.getLogger("kpi_sokuho")


def _parse_and_upsert(store: Store, template_key: str, report_name: str, csv: str) -> None:
    try:
        if report_name == "着信分析 - 総着信数(内訳あり)":
            for r in parse_incom_15min(csv):
                store.upsert_call_15min(template_key, r.date_key, r.bucket, r.metrics)
        elif report_name == "着信分析":
            r = parse_call_or_group_daily(csv)
            store.upsert_call_daily_incoming(template_key, r.date_key, r.metrics)
        elif report_name == "グループ分析":
            r = parse_call_or_group_daily(csv)
            store.upsert_call_daily_group(template_key, r.date_key, r.metrics)
        elif report_name == "オペレーター分析":
            for r in parse_op_daily(csv):
                store.upsert_operator_daily(r.operator_name, r.date_key, r.metrics)
        else:
            log.warning("no parser for report_name=%s (template_key=%s)", report_name, template_key)
    except Exception:
        log.exception("parse/upsert failed for template_key=%s report=%s", template_key, report_name)


def setup_logging(log_path) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
    file_handler = RotatingFileHandler(log_path, maxBytes=5_000_000, backupCount=3, encoding="utf-8")
    file_handler.setFormatter(fmt)
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(fmt)
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.addHandler(file_handler)
    root.addHandler(stream_handler)


async def run() -> None:
    cfg = load_config()
    setup_logging(cfg.log_path)
    store = Store(cfg.db_path)
    log.info("starting kpi_sokuho: %d template(s), interval=%ds", len(cfg.templates), cfg.poll_interval_sec)

    async with ctstage_session(cfg.url, cfg.headless) as ct:
        await ct.logon(cfg.user_id, cfg.password)
        log.info("logon complete")

        while True:
            cycle_started = asyncio.get_event_loop().time()
            try:
                for template in cfg.templates:
                    rows = await ct.run_template(template)
                    for report_name, csv, target in rows:
                        store.insert_snapshot(template, report_name, target, csv)
                        _parse_and_upsert(store, template, report_name, csv)
                        log.info("captured template=%s report=%s rows≈%d", template, report_name, csv.count("\n"))
            except Exception:
                log.exception("cycle failed")
                if await ct.is_logged_out():
                    log.warning("session expired, re-logging in")
                    await ct.logon(cfg.user_id, cfg.password)

            elapsed = asyncio.get_event_loop().time() - cycle_started
            await asyncio.sleep(max(0.0, cfg.poll_interval_sec - elapsed))


if __name__ == "__main__":
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        log.info("shutting down")
