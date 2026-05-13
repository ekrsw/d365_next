from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from playwright.async_api import Page, async_playwright

log = logging.getLogger(__name__)


_RUN_TEMPLATE_JS = """async (templateName) => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const wait = async (cond, tries) => {
        for (let i = 0; i < tries; i++) {
            await sleep(100);
            if (cond()) return true;
        }
        return false;
    };

    const title = document.getElementById('template-title');
    const sel = document.getElementById('template-download-select');
    const btn = document.getElementById('template-creation-btn');
    if (!title || !sel || !btn) return { error: 'missing dialog element' };

    if (!sel.offsetParent) {
        title.click();
        if (!(await wait(() => !!sel.offsetParent, 50))) return { error: 'dialog did not open' };
    }

    // Clear all slots so leftover data from previous template doesn't leak in
    const list = window.ReportDataList || [];
    for (const r of list) {
        if (r?.FileData?.Set) r.FileData.Set('');
        if (r?.Name?.Set) r.Name.Set('');
    }

    sel.value = templateName;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(100);
    btn.click();

    // title.innerText flips to templateName synchronously on click — must also wait for
    // FileData to actually arrive (~100ms-700ms depending on payload size).
    const ready = await wait(
        () => title.innerText && title.innerText.trim() === templateName
            && (window.ReportDataList || []).some(r => r?.FileData?.Get?.()?.length > 0),
        300
    );
    if (!ready) return { error: 'template never finished (data did not arrive)' };
    await sleep(1000);  // buffer for second file (multi-file templates)

    const slots = [];
    for (let i = 0; i < list.length; i++) {
        const r = list[i];
        if (!r?.FileData?.Get || !r?.Name?.Get) continue;
        const csv = r.FileData.Get();
        const name = r.Name.Get();
        if (!csv || !name) continue;
        const target = r.Target?.Get?.() || '';
        slots.push({ slot: i, name, csv, target });
    }
    return { slots };
}"""


class CTstage:
    def __init__(self, page: Page, url: str) -> None:
        self._page = page
        self._url = url

    async def logon(self, user_id: str, password: str) -> None:
        await self._page.goto(self._url, wait_until="domcontentloaded")
        await self._page.locator("#logon-operator-id").fill(user_id)
        await self._page.locator("#logon-operator-password").fill(password)
        await self._page.locator("#logon-btn").click()
        await self._page.wait_for_url("**/Home/Index", timeout=15_000)

    async def is_logged_out(self) -> bool:
        return await self._page.locator("#logon-btn").count() > 0

    async def run_template(self, template_name: str) -> list[tuple[str, str, str]]:
        """Run template, clear slots beforehand, return all populated (report_name, csv, target) tuples."""
        result = await self._page.evaluate(_RUN_TEMPLATE_JS, template_name)
        if "error" in result:
            raise RuntimeError(f"run_template({template_name}) failed: {result['error']}")
        return [(s["name"], s["csv"], s.get("target", "")) for s in result["slots"]]


@asynccontextmanager
async def ctstage_session(url: str, headless: bool) -> AsyncIterator[CTstage]:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        context = await browser.new_context()
        page = await context.new_page()
        try:
            yield CTstage(page, url)
        finally:
            await context.close()
            await browser.close()
