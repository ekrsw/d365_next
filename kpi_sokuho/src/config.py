from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent


@dataclass(frozen=True)
class Config:
    url: str
    user_id: str
    password: str
    templates: list[str]
    poll_interval_sec: int
    db_path: Path
    log_path: Path
    headless: bool


def load_config() -> Config:
    load_dotenv(ROOT / ".env")

    url = os.environ["URL"]
    user_id = os.environ["ID"]
    password = os.environ.get("PASSWORD", "")
    templates = [t.strip() for t in os.environ.get("TEMPLATES", "").split(",") if t.strip()]
    if not templates:
        raise ValueError("TEMPLATES must list at least one template name")
    poll_interval_sec = int(os.environ.get("POLL_INTERVAL_SEC", "60"))
    headless = os.environ.get("HEADLESS", "true").lower() != "false"

    return Config(
        url=url,
        user_id=user_id,
        password=password,
        templates=templates,
        poll_interval_sec=poll_interval_sec,
        db_path=ROOT / "data" / "kpi.db",
        log_path=ROOT / "logs" / "scraper.log",
        headless=headless,
    )
