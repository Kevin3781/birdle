# -*- coding: utf-8 -*-
"""
localize_photos.py — download each bird's Wikimedia photo into the repo so the hosted
site serves photos itself instead of hot-linking Wikimedia (which 429-throttles and
disallows hotlinking at scale). Saves photos/<id>.jpg and records the local path in
js/media.js as `photo`. The game prefers media(id).photo (via ASSET_BASE) and falls back
to bird.imageUrl (the Commons source, still used for credit links).

Stdlib-only. Polite: sequential with a throttle + 429 backoff (same as make_silhouette).

Usage:
  python scripts/localize_photos.py            # all birds (skips ones already done)
  python scripts/localize_photos.py --ids satyr-tragopan,mute-swan
  python scripts/localize_photos.py --overwrite
"""
import argparse, os, sys, time, urllib.request, urllib.error

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib

UA = "BirdleMediaBot/1.0 (self-hosting photos for a free game; contact: birdle.app)"
PHOTOS_DIR = os.path.join(lib.REPO_ROOT, "photos")
THROTTLE_SEC = 1.5          # polite gap between Wikimedia downloads
REL = "photos/{}.jpg"


def download(url, retries=5):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries - 1:
                wait = 5.0 * (attempt + 1)
                print(f"      -> 429, backing off {wait:.0f}s ({attempt+1}/{retries})")
                time.sleep(wait); continue
            raise
        except Exception:
            if attempt < retries - 1:
                time.sleep(2.0 * (attempt + 1)); continue
            raise


def main():
    ap = argparse.ArgumentParser(description="Self-host bird photos into photos/<id>.jpg")
    ap.add_argument("--ids", help="comma-separated bird ids (default: all)")
    ap.add_argument("--overwrite", action="store_true")
    args = ap.parse_args()

    birds = lib.load_birds()
    if args.ids:
        want = {x.strip() for x in args.ids.split(",")}
        birds = [b for b in birds if b["id"] in want]

    os.makedirs(PHOTOS_DIR, exist_ok=True)
    counts = {"ok": 0, "skip": 0, "fail": 0}
    failed = []
    for b in birds:
        bid, url = b["id"], b["imageUrl"]
        dest = os.path.join(PHOTOS_DIR, f"{bid}.jpg")
        rel = REL.format(bid)
        if os.path.exists(dest) and not args.overwrite:
            counts["skip"] += 1
            lib.update_media_entry(bid, photo=rel)   # ensure recorded
            continue
        if not url:
            print(f"  [warn] {bid}: no imageUrl"); counts["fail"] += 1; failed.append(bid); continue
        try:
            data = download(url)
            with open(dest, "wb") as fh:
                fh.write(data)
            lib.update_media_entry(bid, photo=rel)
            counts["ok"] += 1
            print(f"  [ok] {bid} <- {len(data)//1024} KB")
        except Exception as e:
            print(f"  [fail] {bid}: {e}")
            counts["fail"] += 1; failed.append(bid)
        time.sleep(THROTTLE_SEC)

    print(f"\nDone: {counts}")
    if failed:
        print("Failed (re-run to resume):", failed)


if __name__ == "__main__":
    main()
