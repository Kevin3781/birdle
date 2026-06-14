# -*- coding: utf-8 -*-
"""
lint_data.py — offline integrity check for the bird dataset + media. Catches the
mistakes that otherwise need a human/Claude to eyeball: duplicate ids, missing
clue text, missing/invalid silhouetteType, and media coverage gaps. Stdlib-only.

Usage:
  python scripts/lint_data.py            # full report
  python scripts/lint_data.py --strict   # exit non-zero on any problem
"""
import argparse, os, re, sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib

VALID_SILHOUETTES = {
    "passerine", "corvid", "raptor", "owl", "waterfowl", "wading-bird", "penguin",
    "seabird-compact", "tern-gull", "large-soaring", "hummingbird", "parrot",
    "kingfisher", "large-terrestrial",
}


def parse_silhouette_map(text):
    m = re.search(r"SILHOUETTE_BY_ID\s*=\s*\{(.*?)\n\s*\};", text, re.S)
    if not m:
        return {}
    return dict(re.findall(r"'([a-z0-9\-]+)'\s*:\s*'([a-z0-9\-]+)'", m.group(1)))


def main():
    ap = argparse.ArgumentParser(description="Lint Birdle data + media coverage")
    ap.add_argument("--strict", action="store_true", help="exit 1 if any problem found")
    args = ap.parse_args()

    with open(lib.BIRDS_JS, encoding="utf-8") as fh:
        text = fh.read()
    birds = lib.load_birds()
    headers = list(lib._HDR.finditer(text))
    sil_map = parse_silhouette_map(text)
    media = lib.load_media()

    problems = []

    # 1. duplicate ids
    seen = {}
    for b in birds:
        seen[b["id"]] = seen.get(b["id"], 0) + 1
    dupes = [i for i, n in seen.items() if n > 1]
    if dupes:
        problems.append(f"duplicate ids: {dupes}")

    # 2. per-bird field checks
    for i, h in enumerate(headers):
        end = headers[i + 1].start() if i + 1 < len(headers) else len(text)
        block = text[h.end():end]
        bid = h.group("id")
        if not lib._IMG.search(block):
            problems.append(f"{bid}: missing imageUrl")
        for field in ("region", "behavior"):
            m = re.search(rf"{field}:\s*(['\"])(.*?)\1", block)
            if not m or not m.group(2).strip():
                problems.append(f"{bid}: empty/missing hints.{field} (a clue)")
        # 3. silhouetteType coverage
        st = sil_map.get(bid)
        if not st:
            problems.append(f"{bid}: no SILHOUETTE_BY_ID entry")
        elif st not in VALID_SILHOUETTES:
            problems.append(f"{bid}: invalid silhouetteType {st!r}")

    # 4. media coverage report
    n = len(birds)
    have_audio = [b["id"] for b in birds if media.get(b["id"], {}).get("audio")]
    no_audio   = [b["id"] for b in birds if media.get(b["id"], {}).get("audio") is False]
    untried    = [b["id"] for b in birds if b["id"] not in media or "audio" not in media[b["id"]]]
    have_sil   = [b["id"] for b in birds if media.get(b["id"], {}).get("silhouette")]

    print("── Data integrity ─────────────────────────")
    if problems:
        for p in problems:
            print(f"  ✗ {p}")
    else:
        print("  ✓ no data problems")

    print("\n── Media coverage ─────────────────────────")
    print(f"  birds:            {n}")
    print(f"  audio present:    {len(have_audio)}")
    print(f"  audio = none:     {len(no_audio)}  (excluded under the 'no open audio' policy)")
    print(f"  audio not tried:  {len(untried)}")
    print(f"  silhouettes:      {len(have_sil)}/{n}")
    if no_audio:
        print(f"  → would be excluded: {sorted(no_audio)}")
    missing_sil = sorted(set(b['id'] for b in birds) - set(have_sil))
    if missing_sil:
        print(f"  → still need a species silhouette: {missing_sil}")

    if args.strict and problems:
        sys.exit(1)


if __name__ == "__main__":
    main()
