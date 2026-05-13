from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS snapshots (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  captured_at  TEXT    NOT NULL,
  template_key TEXT    NOT NULL,
  report_name  TEXT    NOT NULL,
  target       TEXT    NOT NULL,
  raw_csv      TEXT    NOT NULL,
  row_count    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_snapshots_key_time
  ON snapshots(template_key, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_report_time
  ON snapshots(report_name, captured_at DESC);

CREATE TABLE IF NOT EXISTS call_metrics_15min (
  template_key                 TEXT    NOT NULL,
  date_key                     TEXT    NOT NULL,
  bucket                       TEXT    NOT NULL,
  updated_at                   TEXT    NOT NULL,
  total_incoming               INTEGER,
  acd_handover                 INTEGER,
  ivr_disconnect               INTEGER,
  ivr_reject                   INTEGER,
  ivr_abandon_before_response  INTEGER,
  simultaneous_limit_exceeded  INTEGER,
  external_individual_incoming INTEGER,
  PRIMARY KEY (template_key, date_key, bucket)
);

CREATE TABLE IF NOT EXISTS call_metrics_daily (
  template_key                 TEXT    NOT NULL,
  date_key                     TEXT    NOT NULL,
  updated_at                   TEXT    NOT NULL,
  total_incoming               INTEGER,
  ivr_abandon_before_response  INTEGER,
  ivr_disconnect               INTEGER,
  timeout_count                INTEGER,
  acd_abandon                  INTEGER,
  PRIMARY KEY (template_key, date_key)
);

CREATE TABLE IF NOT EXISTS operator_metrics_daily (
  operator_name                    TEXT    NOT NULL,
  date_key                         TEXT    NOT NULL,
  updated_at                       TEXT    NOT NULL,
  logon_time_sec                   INTEGER,
  total_inbound_talk_sec           INTEGER,
  total_inbound_talk_external_sec  INTEGER,
  total_outbound_talk_sec          INTEGER,
  total_outbound_talk_external_sec INTEGER,
  total_work_time_sec              INTEGER,
  total_inbound_acw_sec            INTEGER,
  total_outbound_acw_sec           INTEGER,
  total_away_sec                   INTEGER,
  idle_time_sec                    INTEGER,
  total_active_sec                 INTEGER,
  total_preparation_sec            INTEGER,
  total_lunch_break_sec            INTEGER,
  total_short_break_sec            INTEGER,
  total_training_meeting_sec       INTEGER,
  total_other_work_sec             INTEGER,
  total_transferable_sec           INTEGER,
  total_peer_assist_sec            INTEGER,
  total_doc_review_sec             INTEGER,
  total_doc_creation_sec           INTEGER,
  PRIMARY KEY (operator_name, date_key)
);
"""


_CALL_15MIN_COLS = (
    "total_incoming", "acd_handover", "ivr_disconnect", "ivr_reject",
    "ivr_abandon_before_response", "simultaneous_limit_exceeded", "external_individual_incoming",
)

_CALL_DAILY_INCOMING_COLS = ("total_incoming", "ivr_abandon_before_response", "ivr_disconnect")
_CALL_DAILY_GROUP_COLS = ("timeout_count", "acd_abandon")

_OP_COLS = (
    "logon_time_sec", "total_inbound_talk_sec", "total_inbound_talk_external_sec",
    "total_outbound_talk_sec", "total_outbound_talk_external_sec", "total_work_time_sec",
    "total_inbound_acw_sec", "total_outbound_acw_sec", "total_away_sec", "idle_time_sec",
    "total_active_sec", "total_preparation_sec", "total_lunch_break_sec", "total_short_break_sec",
    "total_training_meeting_sec", "total_other_work_sec", "total_transferable_sec",
    "total_peer_assist_sec", "total_doc_review_sec", "total_doc_creation_sec",
)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _build_upsert(table: str, key_cols: tuple[str, ...], value_cols: tuple[str, ...]) -> str:
    all_cols = key_cols + ("updated_at",) + value_cols
    placeholders = ",".join("?" * len(all_cols))
    update_clause = ",".join(f"{c}=excluded.{c}" for c in ("updated_at",) + value_cols)
    return (
        f"INSERT INTO {table} ({','.join(all_cols)}) VALUES ({placeholders}) "
        f"ON CONFLICT ({','.join(key_cols)}) DO UPDATE SET {update_clause}"
    )


_UPSERT_15MIN = _build_upsert("call_metrics_15min", ("template_key", "date_key", "bucket"), _CALL_15MIN_COLS)
_UPSERT_DAILY_INCOMING = _build_upsert("call_metrics_daily", ("template_key", "date_key"), _CALL_DAILY_INCOMING_COLS)
_UPSERT_DAILY_GROUP = _build_upsert("call_metrics_daily", ("template_key", "date_key"), _CALL_DAILY_GROUP_COLS)
_UPSERT_OP = _build_upsert("operator_metrics_daily", ("operator_name", "date_key"), _OP_COLS)


class Store:
    def __init__(self, db_path: Path) -> None:
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(db_path)
        self._conn.executescript(SCHEMA)
        self._conn.commit()

    def insert_snapshot(self, template_key: str, report_name: str, target: str, raw_csv: str) -> int:
        captured_at = _now()
        row_count = raw_csv.count("\n")
        cur = self._conn.execute(
            "INSERT INTO snapshots (captured_at, template_key, report_name, target, raw_csv, row_count)"
            " VALUES (?, ?, ?, ?, ?, ?)",
            (captured_at, template_key, report_name, target, raw_csv, row_count),
        )
        self._conn.commit()
        return cur.lastrowid

    def upsert_call_15min(self, template_key: str, date_key: str, bucket: str, metrics: dict[str, int]) -> None:
        args = (template_key, date_key, bucket, _now()) + tuple(metrics.get(c) for c in _CALL_15MIN_COLS)
        self._conn.execute(_UPSERT_15MIN, args)
        self._conn.commit()

    def upsert_call_daily_incoming(self, template_key: str, date_key: str, metrics: dict[str, int]) -> None:
        args = (template_key, date_key, _now()) + tuple(metrics.get(c) for c in _CALL_DAILY_INCOMING_COLS)
        self._conn.execute(_UPSERT_DAILY_INCOMING, args)
        self._conn.commit()

    def upsert_call_daily_group(self, template_key: str, date_key: str, metrics: dict[str, int]) -> None:
        args = (template_key, date_key, _now()) + tuple(metrics.get(c) for c in _CALL_DAILY_GROUP_COLS)
        self._conn.execute(_UPSERT_DAILY_GROUP, args)
        self._conn.commit()

    def upsert_operator_daily(self, operator_name: str, date_key: str, metrics: dict[str, int]) -> None:
        args = (operator_name, date_key, _now()) + tuple(metrics.get(c) for c in _OP_COLS)
        self._conn.execute(_UPSERT_OP, args)
        self._conn.commit()

    def close(self) -> None:
        self._conn.close()
