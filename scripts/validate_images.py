# -*- coding: utf-8 -*-
"""
validate_images.py — check that every bird's imageUrl actually resolves to an
image (HTTP 200 + image content-type). Replaces the manual, per-bird Wikimedia
URL-checking step in the add-birds workflow. Stdlib-only.

Usage:
  python scripts/validate_images.py            # check all birds
  python scripts/validate_images.py --ids shoebill,american-robin
Exit code is non-zero if any image is broken (handy for CI / pre-commit).
"""
import argparse, os, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib

UA = {"User-Agent": "BirdleMediaBot/1.0 (image validation; contact birdle.app)"}


def check(bird, retries=4):
    url = bird["imageUrl"]
    if not url:
        return (bird["id"], "MISSING", "no imageUrl")
    for attempt in range(retries):
        try:
            # Range GET keeps it cheap; Wikimedia is unreliable with bare HEAD.
            req = urllib.request.Request(url, headers={**UA, "Range": "bytes=0-0"})
            with urllib.request.urlopen(req, timeout=25) as r:
                ctype = r.headers.get("Content-Type", "")
                code = r.status
            if code in (200, 206) and ctype.startswith("image/"):
                return (bird["id"], "OK", ctype)
            return (bird["id"], "BAD", f"HTTP {code}, type {ctype!r}")
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries - 1:
                time.sleep(1.5 * (attempt + 1))   # back off on rate-limit
                continue
            if e.code == 429:
                return (bird["id"], "RATELIMIT", "HTTP 429 (try again / lower concurrency)")
            return (bird["id"], "BAD", f"HTTP {e.code}")
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(1.0 * (attempt + 1))
                continue
            return (bird["id"], "BAD", str(e))
    return (bird["id"], "RATELIMIT", "HTTP 429")


def main():
    ap = argparse.ArgumentParser(description="Validate bird imageUrl values")
    ap.add_argument("--ids", help="comma-separated bird ids (default: all)")
    args = ap.parse_args()

    birds = lib.load_birds()
    if args.ids:
        wanted = {x.strip() for x in args.ids.split(",")}
        birds = [b for b in birds if b["id"] in wanted]

    print(f"Validating {len(birds)} image URLs...\n")
    bad = []
    with ThreadPoolExecutor(max_workers=4) as ex:
        for bid, status, detail in ex.map(check, birds):
            if status != "OK":
                bad.append((bid, status, detail))
                print(f"  [{status}] {bid}: {detail}")
    if bad:
        print(f"\n{len(bad)} broken image(s) — fix these before shipping.")
        sys.exit(1)
    print(f"All {len(birds)} images OK.")


if __name__ == "__main__":
    main()
