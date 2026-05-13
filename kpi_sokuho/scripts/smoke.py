"""One-shot smoke test: logon, run one template, dump to SQLite, exit.

Captures screenshots at each step for debugging.
Run: uv run python scripts/smoke.py
"""
from __future__ import annotations

import asyncio
import sys
import traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))

from config import load_config
from ctstage import ctstage_session
from store import Store

SHOT_DIR = ROOT / "logs" / "smoke"


async def shot(page, label: str) -> None:
    SHOT_DIR.mkdir(parents=True, exist_ok=True)
    path = SHOT_DIR / f"{label}.png"
    try:
        await page.screenshot(path=str(path), full_page=True)
        print(f"  📸 {path.name}")
    except Exception as e:
        print(f"  (screenshot failed: {e})")


async def main() -> int:
    cfg = load_config()
    cfg_visible = cfg.__class__(**{**cfg.__dict__, "headless": False})
    store = Store(cfg.db_path)
    print(f"templates={cfg.templates} url={cfg.url}")

    async with ctstage_session(cfg_visible.url, headless=False) as ct:
        page = ct._page  # access for screenshots
        try:
            print("→ logon")
            await ct.logon(cfg.user_id, cfg.password)
            await shot(page, "01_after_logon")

            for template in cfg.templates:
                print(f"→ run_template({template})")
                rows = await ct.run_template(template)
                await shot(page, f"02_after_run_{template}")
                print(f"  got {len(rows)} dataset(s)")
                for name, csv in rows:
                    store.insert_snapshot(name, csv)
                    print(f"  stored template={template} report={name} rows≈{csv.count(chr(10))} bytes={len(csv)}")
        except Exception:
            print("✗ FAILED")
            traceback.print_exc()
            await shot(page, "99_error")
            return 1

    print("✓ done")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
