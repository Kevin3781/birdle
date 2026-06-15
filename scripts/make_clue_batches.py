# -*- coding: utf-8 -*-
"""
make_clue_batches.py — split the ingested birds that still need clue text into
per-agent assignment files. Each batch file lists, per bird, its source path and
the FORBIDDEN words (common+scientific name parts) that must not appear in the
pre-reveal clues. A Sonnet agent reads one batch file and emits the matching
scripts/clues/batchNN.json; apply_clues.py then validates + merges.

Usage:
  python scripts/make_clue_batches.py            # default batch size 60
  python scripts/make_clue_batches.py --size 50
"""
import argparse, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib
import apply_clues as ac

BATCH_DIR = os.path.join(lib.REPO_ROOT, "scripts", "clues_batches")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--size", type=int, default=60, help="birds per batch/agent")
    args = ap.parse_args()

    ingested = lib.load_ingested()
    todo = [b for b in ingested if not b.get("hints", {}).get("region")]
    print(f"{len(todo)} of {len(ingested)} ingested birds still need clue text.")
    if not todo:
        return

    os.makedirs(BATCH_DIR, exist_ok=True)
    batches = [todo[i:i + args.size] for i in range(0, len(todo), args.size)]
    for n, batch in enumerate(batches, 1):
        path = os.path.join(BATCH_DIR, f"batch{n:02d}.txt")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(f"# Birdle clue batch {n:02d} — {len(batch)} birds.\n"
                     f"# For each: read the source file, write region/behavior/funFact.\n"
                     f"# 'forbidden' words must NOT appear in region or behavior (spoilers).\n\n")
            for b in batch:
                forbidden = ", ".join(sorted(ac.spoiler_terms(b)))
                fh.write(f"{b['id']}\n"
                         f"  source: scripts/sources/{b['id']}.txt\n"
                         f"  forbidden: {forbidden}\n\n")
        print(f"  wrote {path}  ({len(batch)} birds) -> agent emits scripts/clues/batch{n:02d}.json")
    print(f"\n{len(batches)} batches. Spawn one Sonnet agent per batch file.")


if __name__ == "__main__":
    main()
