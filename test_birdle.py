# -*- coding: utf-8 -*-
"""
Birdle integration test (hub-and-spoke redesign).
Run: python test_birdle.py
"""
import sys, threading, time, os
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from http.server import HTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright

PORT = 8743
BASE = "C:/src/birdle"
URL  = f"http://localhost:{PORT}"

# The daily bird is date-seeded (and UTC-dependent), so the test reads it live
# from the app rather than hardcoding — robust across timezones and days.
# Candidate wrong guesses; we always exclude the live answer and take 5.
WRONG_CANDIDATES = ["Atlantic Puffin", "Snowy Owl", "Mallard", "Osprey", "Barn Owl", "Blue Jay"]

def daily_name(page):
    return page.evaluate("Birds.getDailyBird().commonName")

def wrongs_for(page, answer):
    return [b for b in WRONG_CANDIDATES if b.lower() != answer.lower()][:5]

# ── HTTP server ──────────────────────────────────────────────────────────────
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=BASE, **kw)

def start_server():
    s = HTTPServer(("localhost", PORT), QuietHandler)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s

# ── Helpers ──────────────────────────────────────────────────────────────────
SCREENSHOTS = []

def ss(page, name):
    os.makedirs("C:/src/birdle/screenshots", exist_ok=True)
    path = f"C:/src/birdle/screenshots/{name}.png"
    page.screenshot(path=path, full_page=False)
    SCREENSHOTS.append(path)
    print(f"  [ss] {name}.png")

def ok(msg):   print(f"  [OK] {msg}")
def step(msg): print(f"  --> {msg}")
def info(msg): print(f"  ... {msg}")

def unlocked_count(page):
    return page.locator('.spoke[data-locked="false"]').count()

def make_guess(page, name, wait=0.8):
    """Type a bird name, pick it from autocomplete, submit."""
    inp = page.locator("#guess-input")
    inp.click()
    inp.fill(name[:4])
    page.wait_for_selector("#guess-suggestions:not([hidden])", timeout=3000)
    sug = page.locator("#guess-suggestions .suggestion-item")
    target = None
    for i in range(sug.count()):
        if name.lower() in sug.nth(i).inner_text().lower():
            target = sug.nth(i)
            break
    assert target is not None, f"{name!r} not found in autocomplete"
    target.click()
    time.sleep(0.12)
    page.locator("#btn-guess").click()
    time.sleep(wait)

def reset(page):
    page.goto(URL, wait_until="networkidle", timeout=15000)
    page.evaluate("localStorage.clear(); localStorage.setItem('birdle_seen_help','1')")
    page.reload(wait_until="networkidle", timeout=15000)
    page.wait_for_selector("#screen-game:not([hidden])", timeout=8000)
    time.sleep(0.3)

# ── Tests ────────────────────────────────────────────────────────────────────

def test_help_modal(page):
    print("\n[TEST 1] Help modal open / close")
    page.click("#btn-help")
    page.wait_for_selector("#overlay-help", state="visible", timeout=5000)
    ss(page, "01_help_open")
    close_btn = page.locator("#btn-close-help")
    assert close_btn.is_visible(), "Close button not visible"
    close_btn.click()
    page.wait_for_selector("#overlay-help", state="hidden", timeout=3000)
    ss(page, "02_help_closed")
    ok("help modal opens and closes")


def test_daily_and_spokes(page):
    daily = daily_name(page)
    print(f"\n[TEST 2] Daily mode — spoke unlock + solve '{daily}'")
    page.wait_for_selector("#screen-game:not([hidden])", timeout=8000)
    ss(page, "03_daily_initial")

    ctx = page.locator("#game-context").inner_text()
    assert "daily" in ctx.lower(), f"Expected 'daily' in context, got {ctx!r}"

    # Exactly one spoke (the song) unlocked at the start
    assert unlocked_count(page) == 1, f"Expected 1 spoke unlocked, got {unlocked_count(page)}"
    song = page.locator('.spoke--song')
    assert song.get_attribute("data-locked") == "false", "Song spoke should be unlocked by default"
    ok("1 spoke unlocked by default (bird song)")

    # One wrong guess → 2 spokes unlocked
    wrong = wrongs_for(page, daily)[0]
    step(f"Wrong guess: {wrong}")
    make_guess(page, wrong)
    ss(page, "04_after_wrong_guess")
    assert page.locator(".guess-row-item--wrong").count() >= 1, "No wrong-guess row"
    assert unlocked_count(page) == 2, f"Expected 2 spokes unlocked, got {unlocked_count(page)}"
    ok("wrong guess unlocks the next spoke (2 open)")

    # Correct guess → bird card + full reveal
    step(f"Correct guess: {daily}")
    make_guess(page, daily, wait=0.2)
    page.wait_for_selector("#overlay-card", state="visible", timeout=6000)
    ss(page, "05_daily_bird_card")

    name = page.locator("#card-name").inner_text().strip()
    assert daily.lower() in name.lower(), f"Wrong bird on card: {name!r}"
    assert unlocked_count(page) == 5, f"All 5 spokes should reveal on win, got {unlocked_count(page)}"
    ok(f"solved → card shows {name!r}, all 5 spokes revealed")

    # Share output: 5 segments, no species name leaked
    assert page.locator("#card-share").is_visible(), "Share block should show on daily"
    segs = page.locator("#share-preview .seg").count()
    assert segs == 5, f"Share preview should have 5 segments, got {segs}"
    share_text = page.locator("#btn-card-share").get_attribute("data-text") or ""
    assert "Birdle" in share_text and "clue" in share_text, f"Bad share text: {share_text!r}"
    all_names = page.evaluate("Birds.getAllBirds().map(b => b.commonName)")
    leaked = [n for n in all_names if n.lower() in share_text.lower()]
    assert not leaked, f"Share text leaked species name(s): {leaked}"
    ok(f"share output: 5 segments, no species name. text={share_text.splitlines()[0]!r}")

    page.locator("#btn-card-close").click()
    page.wait_for_selector("#overlay-card", state="hidden", timeout=3000)


def test_game_over_reveal(page):
    print("\n[TEST 3] Game over (5 wrong) → full reveal")
    reset(page)
    assert unlocked_count(page) == 1
    wrongs = wrongs_for(page, daily_name(page))
    for i, b in enumerate(wrongs):
        if page.locator("#overlay-card").is_visible():
            break
        step(f"Wrong guess {i+1}: {b}")
        make_guess(page, b, wait=1.3 if i == len(wrongs) - 1 else 0.7)

    page.wait_for_selector("#overlay-card", state="visible", timeout=8000)
    ss(page, "06_game_over_card")
    result = page.locator("#card-result").inner_text().lower()
    assert "out of guesses" in result or "nice try" in result, f"Unexpected result: {result!r}"
    assert unlocked_count(page) == 5, f"All spokes should reveal on loss, got {unlocked_count(page)}"
    ok("5 wrong guesses → loss card + all spokes revealed")
    page.locator("#btn-card-close").click()
    page.wait_for_selector("#overlay-card", state="hidden", timeout=3000)


def test_archive_no_stats(page):
    print("\n[TEST 4] Archive — 5 entries, no names, no stats written")
    reset(page)
    stats_before = page.evaluate("localStorage.getItem('birdle_stats')")

    page.locator(".mode-tab[data-mode='archive']").click()
    page.wait_for_selector("#screen-archive:not([hidden])", timeout=5000)
    ss(page, "07_archive_picker")

    items = page.locator(".archive-item")
    assert items.count() == 5, f"Expected 5 archive entries, got {items.count()}"

    all_names = page.evaluate("Birds.getAllBirds().map(b => b.commonName)")
    for i in range(items.count()):
        txt = items.nth(i).inner_text().lower()
        leaked = [n for n in all_names if n.lower() in txt]
        assert not leaked, f"Archive entry {i} leaked bird name(s): {leaked} in {txt!r}"
    ok("5 archive entries shown, none names a bird")

    # Play the first archive entry to completion (5 wrong guesses)
    items.first.click()
    page.wait_for_selector("#screen-game:not([hidden])", timeout=5000)
    ctx = page.locator("#game-context").inner_text()
    assert "archive" in ctx.lower(), f"Expected archive context, got {ctx!r}"
    answer = page.evaluate("Birds.getDailyBirdForOffset(1).commonName")
    wrongs = wrongs_for(page, answer)
    for i, b in enumerate(wrongs):
        if page.locator("#overlay-card").is_visible():
            break
        make_guess(page, b, wait=1.3 if i == len(wrongs) - 1 else 0.6)
    page.wait_for_selector("#overlay-card", state="visible", timeout=8000)
    ss(page, "08_archive_card")

    # Archive must show "Back to Archive", not a share button
    assert page.locator("#btn-card-next").is_visible(), "Archive should offer 'Back to Archive'"
    assert not page.locator("#btn-card-share").is_visible(), "Archive must not show Share"

    stats_after = page.evaluate("localStorage.getItem('birdle_stats')")
    assert stats_before == stats_after, "Archive play modified stats storage!"
    ok(f"archive play wrote no stats (before==after: {stats_after!r})")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    server = start_server()
    print(f"HTTP server: {URL}")
    time.sleep(0.3)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 1000, "height": 820},
            user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"),
        )
        page = ctx.new_page()
        page.add_init_script("localStorage.setItem('birdle_seen_help', '1')")

        js_errors = []
        img_errors = []
        page.on("console", lambda m: js_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: js_errors.append(str(e)))
        page.on("requestfailed", lambda r: img_errors.append(r.url) if r.resource_type == "image" else None)

        print(f"Navigating to {URL} ...")
        page.goto(URL, wait_until="networkidle", timeout=15000)
        time.sleep(0.5)

        passed = failed = 0
        for test_fn, label in [
            (test_help_modal,      "help_modal"),
            (test_daily_and_spokes,"daily_mode"),
            (test_game_over_reveal,"game_over"),
            (test_archive_no_stats,"archive"),
        ]:
            try:
                test_fn(page)
                passed += 1
            except Exception as e:
                failed += 1
                try: ss(page, f"FAIL_{label}")
                except: pass
                print(f"  FAIL [{label}]: {e}")

        print(f"\n{'='*44}")
        print(f"Results: {passed} passed, {failed} failed")

        # Silhouette SVG image requests count as 'image' or 'other'; report non-svg failures
        real_img_fail = [u for u in img_errors if not u.endswith('.svg')]
        if js_errors:
            print(f"\nJS console errors ({len(js_errors)}):")
            for err in js_errors[:10]:
                print(f"  {err}")
        else:
            print("No JS console errors")
        if real_img_fail:
            print(f"\nFailed image requests ({len(real_img_fail)}):")
            for url in real_img_fail[:5]:
                print(f"  {url}")

        browser.close()
    server.shutdown()
    sys.exit(1 if failed else 0)

if __name__ == "__main__":
    main()
