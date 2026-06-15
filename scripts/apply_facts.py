# -*- coding: utf-8 -*-
"""
apply_facts.py — merge agent-written reveal-card facts into js/birds_ingested.js.

The facts agents emit JSON files under scripts/facts/, each mapping bird id -> the four
reveal-card fields (shown AFTER the guess, so no spoiler restriction):

    { "mute-swan": { "size": "...", "habitat": "...", "diet": "...", "migration": "..." }, ... }

Patches each entry's facts.{size,habitat,diet,migration}.

Usage:
  python scripts/apply_facts.py                 # merge every scripts/facts/*.json
  python scripts/apply_facts.py --file scripts/facts/batch01.json
  python scripts/apply_facts.py --check-only
"""
import argparse, glob, json, os, sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib

FACTS_DIR = os.path.join(lib.REPO_ROOT, "scripts", "facts")
KEYS = ("size", "habitat", "diet", "migration")


def main():
    ap = argparse.ArgumentParser(description="Merge facts JSON into birds_ingested.js")
    ap.add_argument("--file", help="single facts JSON (default: all scripts/facts/*.json)")
    ap.add_argument("--check-only", action="store_true")
    args = ap.parse_args()

    files = [args.file] if args.file else sorted(glob.glob(os.path.join(FACTS_DIR, "*.json")))
    if not files:
        ap.error(f"no facts files found in {FACTS_DIR}")

    facts = {}
    for f in files:
        with open(f, encoding="utf-8") as fh:
            facts.update(json.load(fh))

    ingested = lib.load_ingested()
    by_id = {b["id"]: b for b in ingested}

    applied, skipped, flagged = 0, 0, []
    for bid, fct in facts.items():
        bird = by_id.get(bid)
        if not bird:
            skipped += 1
            print(f"  [skip] {bid}: not in birds_ingested.js")
            continue
        missing = [k for k in KEYS if not str(fct.get(k, "")).strip()]
        if missing:
            flagged.append((bid, missing))
            print(f"  [FLAG] {bid}: missing {missing}")
            continue
        if not args.check_only:
            bird.setdefault("facts", {})
            for k in KEYS:
                bird["facts"][k] = str(fct[k]).strip()
        applied += 1

    if not args.check_only and applied:
        lib.save_ingested(ingested)

    done = sum(1 for b in ingested if b.get("facts", {}).get("size"))
    print(f"\nApplied {applied}, skipped {skipped}, flagged {len(flagged)}.")
    print(f"Facts coverage: {done}/{len(ingested)} ingested birds have a full facts block.")
    if flagged:
        sys.exit(1)


if __name__ == "__main__":
    main()
