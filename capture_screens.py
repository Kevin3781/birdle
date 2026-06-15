# -*- coding: utf-8 -*-
"""Capture showcase screenshots of Birdle across key states. Run in the venv."""
import sys, threading, time, os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from http.server import HTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

PORT, BASE = 8743, "C:/src/birdle"
URL = f"http://localhost:{PORT}"
SHOWCASE = "C:/src/birdle/screenshots/showcase"
HERO = "bald-eagle"  # photogenic bird w/ full media; preview mode writes no stats

class Q(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def __init__(self, *a, **kw): super().__init__(*a, directory=BASE, **kw)

def ss(page, name):
    os.makedirs(SHOWCASE, exist_ok=True)
    p = f"{SHOWCASE}/{name}.png"
    page.screenshot(path=p, full_page=False)
    print("  [ss]", name); return p

def guess(page, name, wait=0.7):
    inp = page.locator("#guess-input"); inp.click(); inp.fill(name[:4])
    page.wait_for_selector("#guess-suggestions:not([hidden])", timeout=3000)
    sug = page.locator("#guess-suggestions .suggestion-item")
    for i in range(sug.count()):
        if name.lower() in sug.nth(i).inner_text().lower():
            sug.nth(i).click(); break
    time.sleep(0.12); page.locator("#btn-guess").click(); time.sleep(wait)

def main():
    srv = HTTPServer(("localhost", PORT), Q)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        page = b.new_page(viewport={"width": 1366, "height": 900}, device_scale_factor=2)

        # Seed: suppress first-run help, start a clean preview game on the hero bird.
        page.goto(URL, wait_until="networkidle", timeout=15000)
        page.evaluate("localStorage.clear(); localStorage.setItem('birdle_seen_help','1')")
        page.goto(f"{URL}?bird={HERO}", wait_until="networkidle", timeout=15000)
        page.wait_for_selector("#screen-game:not([hidden])", timeout=8000); time.sleep(0.5)
        ss(page, "01_hub_initial")              # 1 spoke (song) unlocked

        # Autocomplete open
        inp = page.locator("#guess-input"); inp.click(); inp.fill("nor")
        page.wait_for_selector("#guess-suggestions:not([hidden])", timeout=3000); time.sleep(0.3)
        ss(page, "02_autocomplete"); inp.fill(""); page.keyboard.press("Escape")

        # Mid game: 3 wrong → 4 spokes open (song, habitat, behaviour, silhouette)
        for w in ["Mallard", "Snowy Owl", "Atlantic Puffin"]:
            guess(page, w)
        ss(page, "03_midgame_spokes")

        # Solve → reveal card with share
        guess(page, "Bald Eagle", wait=1.0)
        page.wait_for_selector("#overlay-card", state="visible", timeout=5000); time.sleep(0.4)
        ss(page, "04_reveal_card")

        # Dark mode (toggle), back on a fresh hub
        page.goto(f"{URL}?bird=northern-cardinal", wait_until="networkidle", timeout=15000)
        page.wait_for_selector("#screen-game:not([hidden])", timeout=8000)
        page.click("#btn-theme"); time.sleep(0.4)
        ss(page, "05_dark_hub")

        # Archive picker (light theme)
        page.click("#btn-theme"); time.sleep(0.2)  # back to light
        page.goto(URL, wait_until="networkidle", timeout=15000)
        page.wait_for_selector("#screen-game:not([hidden])", timeout=8000)
        page.click('.mode-tab[data-mode="archive"]'); time.sleep(0.6)
        ss(page, "06_archive_picker")

        # Help / onboarding
        page.click("#btn-help"); page.wait_for_selector("#overlay-help", state="visible", timeout=5000)
        time.sleep(0.3); ss(page, "07_help_onboarding")

        b.close()
    print("Done ->", SHOWCASE)

if __name__ == "__main__":
    main()
