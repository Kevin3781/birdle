# -*- coding: utf-8 -*-
"""
fetch_audio.py — download a bird-call recording from an OPEN source and store it
locally, so the game can embed it without leaking the answer in a query string.

Sources (in order):
  1. iNaturalist  — keyless, CC-licensed. Great coverage for vocal species.
  2. Xeno-canto v3 — only if env var XENO_CANTO_KEY is set. Best overall coverage
     (incl. species iNaturalist lacks, e.g. the Shoebill's bill-clatter).

Recordings are saved to  audio/<bird-id>.<ext>  and recorded in  js/media.js
(audio path + attribution). Stdlib-only — no pip install required.

Usage:
  python scripts/fetch_audio.py --ids shoebill,american-robin
  python scripts/fetch_audio.py --all
  python scripts/fetch_audio.py --all --limit 5 --overwrite
  XENO_CANTO_KEY=xxxx python scripts/fetch_audio.py --ids shoebill
"""
import argparse, json, os, re, sys, urllib.parse, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib

UA = "BirdleMediaBot/1.0 (educational bird-guessing game; contact: birdle.app)"
AUDIO_DIR = os.path.join(lib.REPO_ROOT, "audio")
CC_OK = {"cc0", "cc-by", "cc-by-nc", "cc-by-sa", "cc-by-nc-sa", "cc-by-nc-nd", "cc-by-nd"}


def _get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=timeout).read()


def _download(url, dest, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read()
    with open(dest, "wb") as fh:
        fh.write(data)
    return len(data)


def _ext_from_url(url, default=".mp3"):
    path = urllib.parse.urlparse(url).path
    ext = os.path.splitext(path)[1].lower()
    return ext if ext in {".mp3", ".m4a", ".wav", ".ogg", ".flac"} else default


# ── Source: iNaturalist ───────────────────────────────────────────────────────
def from_inaturalist(sci_name):
    """Return (download_url, ext, attribution) or None."""
    q = urllib.parse.urlencode({
        "taxon_name": sci_name, "sounds": "true",
        "per_page": 30, "order_by": "votes", "order": "desc",
    })
    try:
        data = json.loads(_get(f"https://api.inaturalist.org/v1/observations?{q}"))
    except Exception as e:
        print(f"      iNat error: {e}")
        return None
    # Prefer compressed formats (smaller payloads); within a format, keep the
    # highest-voted recording. Results already arrive sorted by votes.
    fmt_rank = {".mp3": 0, ".m4a": 1, ".ogg": 2, ".flac": 3, ".wav": 4}
    best = None  # (fmt_rank, obs_idx, url, ext, attribution)
    for i, obs in enumerate(data.get("results", [])):
        for snd in (obs.get("sounds") or []):
            url = snd.get("file_url")
            lic = (snd.get("license_code") or "").lower()
            if url and lic in CC_OK:
                ext = _ext_from_url(url)
                user = (obs.get("user") or {}).get("login", "unknown")
                attribution = f"iNaturalist (c) {user}, {lic.upper()} — observation {obs.get('id')}"
                cand = (fmt_rank.get(ext, 5), i, url, ext, attribution)
                if best is None or cand[:2] < best[:2]:
                    best = cand
    if best:
        return best[2], best[3], best[4]
    return None


# ── Source: Xeno-canto v3 (keyed) ─────────────────────────────────────────────
def _xc_key():
    """Resolve the Xeno-canto v3 key from the env or a file kept OUT of the repo."""
    k = os.environ.get("XENO_CANTO_KEY")
    if k:
        return k.strip()
    for p in (os.path.join(os.path.expanduser("~"), ".birdle", "xeno_canto_key"),
              os.path.join(lib.REPO_ROOT, "scripts", ".xeno_canto_key")):
        if os.path.exists(p):
            with open(p, encoding="utf-8") as fh:
                return fh.read().strip()
    return None


def from_xeno_canto(sci_name):
    key = _xc_key()
    if not key:
        return None
    # v3 only accepts TAG queries (gen:/sp:), not free text.
    parts = sci_name.split()
    if len(parts) < 2:
        return None
    query = f"gen:{parts[0]} sp:{parts[1]}"
    q = urllib.parse.urlencode({"query": query, "key": key})
    try:
        data = json.loads(_get(f"https://xeno-canto.org/api/3/recordings?{q}"))
    except Exception as e:
        print(f"      Xeno-canto error: {e}")
        return None
    recs = data.get("recordings") or []
    recs.sort(key=lambda r: r.get("q", "E"))  # 'A' (best) sorts first
    for r in recs:
        url = r.get("file")
        if url:
            attribution = f"Xeno-canto (c) {r.get('rec','unknown')}, {r.get('lic','')} — XC{r.get('id')}"
            return url, _ext_from_url(url), attribution
    return None


# ── Manual override: a specific, user-CLEARED clip (any source) ───────────────
def _resolve_macaulay(url):
    """Turn a macaulaylibrary.org/asset/<id> page URL into its CDN audio URL."""
    m = re.search(r"macaulaylibrary\.org/asset/(\d+)", url)
    if m:
        return f"https://cdn.download.ams.birds.cornell.edu/api/v1/asset/{m.group(1)}/audio", ".mp3"
    return url, _ext_from_url(url)

def fetch_manual(bird, manual_url, attribution=None):
    """Download a hand-picked clip the user has the rights to use. Source-agnostic.
    NOTE: only use sources you're licensed to self-host (CC, your own, or ML for
    personal/educational use per their terms)."""
    bid = bird["id"]
    url, ext = _resolve_macaulay(manual_url)
    os.makedirs(AUDIO_DIR, exist_ok=True)
    dest = os.path.join(AUDIO_DIR, f"{bid}{ext}")
    print(f"  [audio:manual] {bid} <- {manual_url}")
    try:
        size = _download(url, dest)
    except Exception as e:
        print(f"      -> download failed: {e}")
        return "fail"
    rel = f"audio/{bid}{ext}"
    attribution = attribution or f"Manual source: {manual_url}"
    lib.update_media_entry(bid, audio=rel, audioAttribution=attribution)
    print(f"      -> {rel} ({size//1024} KB) | {attribution}")
    return "ok"


# ── Per-bird ──────────────────────────────────────────────────────────────────
def fetch_one(bird, overwrite=False):
    bid, sci = bird["id"], bird["scientificName"]
    media = lib.load_media().get(bid, {})
    if media.get("audio") and not overwrite:
        existing = os.path.join(lib.REPO_ROOT, media["audio"])
        if os.path.exists(existing):
            print(f"  [skip] {bid}: already has {media['audio']}")
            return "skip"

    print(f"  [audio] {bid} ({sci})")
    found = from_inaturalist(sci) or from_xeno_canto(sci)
    if not found:
        # No open recording. Record an explicit null so the game shows the neutral
        # "no recording available" state (no spoiler), not a query link.
        lib.update_media_entry(bid, audio=False, audioAttribution=False)
        print(f"      -> none found (graceful empty-state)")
        return "empty"

    url, ext, attribution = found
    os.makedirs(AUDIO_DIR, exist_ok=True)
    dest = os.path.join(AUDIO_DIR, f"{bid}{ext}")
    try:
        size = _download(url, dest)
    except Exception as e:
        print(f"      -> download failed: {e}")
        return "fail"
    rel = f"audio/{bid}{ext}"
    lib.update_media_entry(bid, audio=rel, audioAttribution=attribution)
    print(f"      -> {rel} ({size//1024} KB) | {attribution}")
    return "ok"


def main():
    ap = argparse.ArgumentParser(description="Download open bird recordings into audio/ + js/media.js")
    ap.add_argument("--ids", help="comma-separated bird ids")
    ap.add_argument("--all", action="store_true", help="process every bird")
    ap.add_argument("--limit", type=int, help="cap the number processed")
    ap.add_argument("--overwrite", action="store_true", help="re-download even if present")
    ap.add_argument("--manual-url", help="download a specific cleared clip for a single --ids bird "
                    "(accepts a direct file URL or a macaulaylibrary.org/asset/<id> link)")
    ap.add_argument("--attribution", help="attribution string to store with --manual-url")
    args = ap.parse_args()

    birds = lib.load_birds()
    targets = lib.select_birds(birds, ids=args.ids.split(",") if args.ids else None,
                               do_all=args.all, limit=args.limit)
    if not targets:
        ap.error("nothing selected — pass --ids <a,b> or --all")

    if args.manual_url:
        if len(targets) != 1:
            ap.error("--manual-url requires exactly one bird via --ids")
        fetch_manual(targets[0], args.manual_url, args.attribution)
        return

    counts = {}
    for b in targets:
        r = fetch_one(b, overwrite=args.overwrite)
        counts[r] = counts.get(r, 0) + 1
    print(f"\nDone: {counts}")


if __name__ == "__main__":
    main()
