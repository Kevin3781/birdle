# -*- coding: utf-8 -*-
"""
fetch_credits.py — pull per-photo attribution (author + license + file page) from
the Wikimedia Commons API and record it in js/media.js, so the game can show proper
credits. Needed for hosting/sharing in compliance with CC-BY / CC-BY-SA. Stdlib-only.

Writes per bird into media.js:
  imageArtist, imageLicense, imageLicenseUrl, imageSource

Usage:
  python scripts/fetch_credits.py --ids shoebill,american-robin
  python scripts/fetch_credits.py --all
"""
import argparse, html, json, os, re, sys, urllib.parse, urllib.request

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib

UA = {"User-Agent": "BirdleMediaBot/1.0 (credits/attribution)"}


def _get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25).read()


def file_title_from_url(url):
    """Extract the Commons 'File:NAME' from an upload.wikimedia.org URL."""
    parts = urllib.parse.urlparse(url).path.split("/")
    try:
        if "thumb" in parts:
            i = parts.index("thumb")
            fname = parts[i + 3]
        else:
            i = parts.index("commons")
            fname = parts[i + 3]
    except (ValueError, IndexError):
        return None
    return urllib.parse.unquote(fname)


def _strip_html(s):
    s = re.sub(r"<[^>]+>", "", s or "")
    return html.unescape(s).strip()


def fetch_one(bird):
    bid, url = bird["id"], bird["imageUrl"]
    title = file_title_from_url(url)
    if not title:
        print(f"  [warn] {bid}: can't parse file name from URL")
        return "fail"
    api = ("https://commons.wikimedia.org/w/api.php?action=query&titles="
           + urllib.parse.quote("File:" + title)
           + "&prop=imageinfo&iiprop=extmetadata|url&format=json")
    try:
        data = json.loads(_get(api))
        page = next(iter(data["query"]["pages"].values()))
        info = page["imageinfo"][0]
        ext = info.get("extmetadata", {})
    except Exception as e:
        print(f"  [warn] {bid}: API error {e}")
        return "fail"

    artist = _strip_html(ext.get("Artist", {}).get("value", "")) or "Unknown"
    license_name = _strip_html(ext.get("LicenseShortName", {}).get("value", "")) or "see source"
    license_url = ext.get("LicenseUrl", {}).get("value", "")
    source = info.get("descriptionurl", "")

    lib.update_media_entry(bid, imageArtist=artist, imageLicense=license_name,
                           imageLicenseUrl=license_url, imageSource=source)
    print(f"  [credit] {bid}: {artist} | {license_name}")
    return "ok"


def main():
    ap = argparse.ArgumentParser(description="Fetch Wikimedia photo attribution into media.js")
    ap.add_argument("--ids", help="comma-separated bird ids")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--limit", type=int)
    args = ap.parse_args()

    birds = lib.select_birds(lib.load_birds(), ids=args.ids.split(",") if args.ids else None,
                             do_all=args.all, limit=args.limit)
    if not birds:
        ap.error("nothing selected — pass --ids <a,b> or --all")
    counts = {}
    for b in birds:
        r = fetch_one(b)
        counts[r] = counts.get(r, 0) + 1
    print(f"\nDone: {counts}")


if __name__ == "__main__":
    main()
