"""CSV parsers for the 4 CTstage report shapes."""
from __future__ import annotations

import csv
import io
import re
from dataclasses import dataclass


_CALL_METRIC_JP_TO_COL: dict[str, str] = {
    "総着信数": "total_incoming",
    "ACD引継ぎ数": "acd_handover",
    "IVR切断数": "ivr_disconnect",
    "IVR着信拒否数": "ivr_reject",
    "IVR応答前放棄呼数": "ivr_abandon_before_response",
    "同時着信数制限超過数": "simultaneous_limit_exceeded",
    "外線別個別着信数": "external_individual_incoming",
    "タイムアウト数": "timeout_count",
    "ACD放棄呼数": "acd_abandon",
}

_OP_METRIC_JP_TO_COL: dict[str, str] = {
    "ログオン時間": "logon_time_sec",
    "着信通話時間の合計": "total_inbound_talk_sec",
    "着信通話時間の合計(外線)": "total_inbound_talk_external_sec",
    "発信通話時間の合計": "total_outbound_talk_sec",
    "発信通話時間の合計(外線)": "total_outbound_talk_external_sec",
    "ワークタイムの合計": "total_work_time_sec",
    "着信後処理時間の合計": "total_inbound_acw_sec",
    "発信後処理時間の合計": "total_outbound_acw_sec",
    "離席時間の合計": "total_away_sec",
    "待機時間": "idle_time_sec",
    "稼働時間の合計": "total_active_sec",
    "事前準備時間の合計": "total_preparation_sec",
    "昼休憩時間の合計": "total_lunch_break_sec",
    "一時離席時間の合計": "total_short_break_sec",
    "研修/会議時間の合計": "total_training_meeting_sec",
    "別作業中時間の合計": "total_other_work_sec",
    "転送可時間の合計": "total_transferable_sec",
    "他者支援時間の合計": "total_peer_assist_sec",
    "開発資料確認時間の合計": "total_doc_review_sec",
    "資料作成時間の合計": "total_doc_creation_sec",
}


def _rows(csv_str: str) -> list[list[str]]:
    return list(csv.reader(io.StringIO(csv_str)))


def _date_from_period_row(period_row_text: str) -> str:
    m = re.search(r"集計期間:\s*(\d{4}/\d{2}/\d{2})", period_row_text)
    if not m:
        raise ValueError(f"could not parse date from period row: {period_row_text!r}")
    return m.group(1).replace("/", "-")


def _hms_to_sec(s: str) -> int:
    parts = s.split(":")
    if len(parts) != 3:
        return 0
    return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])


@dataclass
class Incom15minRow:
    date_key: str
    bucket: str
    metrics: dict[str, int]


def parse_incom_15min(csv_str: str) -> list[Incom15minRow]:
    """Parse Incom_Analysis 着信分析-総着信数(内訳あり) (時間×指標 wide format)."""
    rows = _rows(csv_str)
    # rows[0]=title, rows[1]=period, rows[2]=method, rows[3]=target, rows[4]=time header, rows[5+]=data
    date_key = _date_from_period_row(rows[1][0])
    buckets = rows[4][1:]
    by_bucket: dict[str, dict[str, int]] = {b: {} for b in buckets}
    for row in rows[5:]:
        if not row or not row[0]:
            continue
        col = _CALL_METRIC_JP_TO_COL.get(row[0])
        if col is None:
            continue
        for bucket, value in zip(buckets, row[1:]):
            by_bucket[bucket][col] = int(value or 0)
    return [Incom15minRow(date_key=date_key, bucket=b, metrics=m) for b, m in by_bucket.items()]


@dataclass
class CallDailyRow:
    date_key: str
    metrics: dict[str, int]


def parse_call_or_group_daily(csv_str: str) -> CallDailyRow:
    """Parse 着信分析 or グループ分析 (日付別、metric × 1 value)."""
    rows = _rows(csv_str)
    # rows[0]=title, rows[1]=period, rows[2]=method, rows[3]=target, rows[4]=date header, rows[5+]=metric rows
    date_key = rows[4][1].replace("/", "-")
    metrics: dict[str, int] = {}
    for row in rows[5:]:
        if not row or not row[0]:
            continue
        col = _CALL_METRIC_JP_TO_COL.get(row[0])
        if col is None:
            continue
        metrics[col] = int(row[1] or 0)
    return CallDailyRow(date_key=date_key, metrics=metrics)


@dataclass
class OpDailyRow:
    operator_name: str
    date_key: str
    metrics: dict[str, int]


def parse_op_daily(csv_str: str) -> list[OpDailyRow]:
    """Parse オペレーター分析 (operator × metric wide format)."""
    rows = _rows(csv_str)
    # rows[0]=title, rows[1]=period, rows[2]=target (operator name list), rows[3]=column header, rows[4+]=data
    date_key = _date_from_period_row(rows[1][0])
    header = rows[3][1:]
    cols = [_OP_METRIC_JP_TO_COL.get(h) for h in header]
    out: list[OpDailyRow] = []
    for row in rows[4:]:
        if not row or not row[0]:
            continue
        operator_name = row[0]
        metrics: dict[str, int] = {}
        for col, value in zip(cols, row[1:]):
            if col is None:
                continue
            metrics[col] = _hms_to_sec(value)
        out.append(OpDailyRow(operator_name=operator_name, date_key=date_key, metrics=metrics))
    return out
