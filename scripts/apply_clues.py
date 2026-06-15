# -*- coding: utf-8 -*-
"""
apply_clues.py — merge agent-written clue text into js/birds_ingested.js.

The clue-writing Sonnet agents emit JSON files under scripts/clues/, each mapping
bird id -> the three fields the game actually renders:

    {
      "mute-swan": {
        "region":   "<clue 2: habitat + geographic range, no species name>",
        "behavior": "<clue 3: behaviour + diet, no species name>",
        "funFact":  "<one-sentence reveal-card fact>"
      },
      ...
    }

This script patches each entry's hints.region / hints.behavior / funFact, and runs a
SPOILER CHECK: region/behavior must not contain the bird's common name or any word of
its scientific name (those are guess-time clues; naming the bird gives it away).

Usage:
  python scripts/apply_clues.py                       # merge every scripts/clues/*.json
  python scripts/apply_clues.py --file scripts/clues/batch01.json
  python scripts/apply_clues.py --check-only          # validate, write nothing
"""
import argparse, glob, json, os, re, sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib

CLUES_DIR = os.path.join(lib.REPO_ROOT, "scripts", "clues")
STOPWORDS = {"common", "great", "greater", "lesser", "northern", "southern", "eastern",
             "western", "american", "european", "eurasian", "little", "grey", "gray",
             "red", "blue", "black", "white", "yellow", "green", "brown", "of", "the"}


def spoiler_terms(bird):
    """Words that would give the answer away if they appear in a guess-time clue."""
    terms = set()
    for w in re.split(r"[\s\-]+", bird["commonName"].lower()):
        w = re.sub(r"[^a-z]", "", w)
        if len(w) > 3 and w not in STOPWORDS:
            terms.add(w)
    for w in bird["scientificName"].lower().split():
        w = re.sub(r"[^a-z]", "", w)
        if len(w) > 3:
            terms.add(w)
    return terms


def check_entry(bird, clue):
    problems = []
    for field in ("region", "behavior", "funFact"):
        if not clue.get(field, "").strip():
            problems.append(f"empty {field}")
    text = f"{clue.get('region','')} {clue.get('behavior','')}".lower()
    for t in spoiler_terms(bird):
        if re.search(rf"\b{re.escape(t)}", text):
            problems.append(f"SPOILER '{t}' in clue 2/3")
    return problems


def main():
    ap = argparse.ArgumentParser(description="Merge clue JSON into birds_ingested.js")
    ap.add_argument("--file", help="a single clue JSON (default: all scripts/clues/*.json)")
    ap.add_argument("--check-only", action="store_true", help="validate only, write nothing")
    args = ap.parse_args()

    files = [args.file] if args.file else sorted(glob.glob(os.path.join(CLUES_DIR, "*.json")))
    if not files:
        ap.error(f"no clue files found in {CLUES_DIR}")

    clues = {}
    for f in files:
        with open(f, encoding="utf-8") as fh:
            clues.update(json.load(fh))

    ingested = lib.load_ingested()
    by_id = {b["id"]: b for b in ingested}

    applied, skipped, flagged = 0, 0, []
    for bid, clue in clues.items():
        bird = by_id.get(bid)
        if not bird:
            skipped += 1
            print(f"  [skip] {bid}: not in birds_ingested.js")
            continue
        problems = check_entry(bird, clue)
        if problems:
            flagged.append((bid, problems))
            print(f"  [FLAG] {bid}: {'; '.join(problems)}")
            continue
        if not args.check_only:
            bird.setdefault("hints", {})
            bird["hints"]["region"] = clue["region"].strip()
            bird["hints"]["behavior"] = clue["behavior"].strip()
            bird["funFact"] = clue["funFact"].strip()
        applied += 1

    if not args.check_only and applied:
        lib.save_ingested(ingested)

    done = sum(1 for b in ingested if b.get("hints", {}).get("region"))
    print(f"\nApplied {applied}, skipped {skipped}, flagged {len(flagged)}.")
    print(f"Clue coverage: {done}/{len(ingested)} ingested birds have clue text.")
    if flagged:
        print("Fix flagged entries (re-run their agent) before shipping.")
        sys.exit(1)


if __name__ == "__main__":
    main()
