---
name: birdle-ingest-birds
description: Bulk-add many birds to the Birdle pool from a list of common names. Resolves scientific name, Commons image, family/silhouette, and clue-source text from Wikipedia + iNaturalist; audio-gates; then drives media + clue/facts generation. Use for adding birds at scale (dozens to hundreds).
---

Bulk pipeline that grew the pool from 60 to ~481. Use this for adding **many** birds at
once; for one or two hand-picked birds, `birdle-add-birds` is simpler. All Python runs in
the repo venv: `C:\src\birdle\.venv\Scripts\python.exe` (never global — see the
venv-only-python memory).

## 1. Candidate list
Append **common names** (no scientific names — those get resolved) to
`scripts/candidates.txt`, one `Common Name [| region]` per line. Over-provision ~10–15%:
audio-gating and disambiguation failures drop a few. Avoid names that collide with famous
non-bird Wikipedia articles (Merlin→wizard, Tui/Kea→other pages); if you must include one,
fix it afterwards with `scripts/fix_birds.py` (explicit scientific name + Wikipedia title).

## 2. Ingest (resolve everything from APIs)
```bash
.venv/Scripts/python.exe scripts/ingest_birds.py --file scripts/candidates.txt
```
Per bird it resolves scientific name + family (→`silhouetteType`) from iNaturalist, the
Commons lead image + an intro extract (dumped to `scripts/sources/<id>.txt`) from Wikipedia,
and **audio-gates** (drops birds with no open iNat/Xeno-canto recording). Survivors are
appended to the generated `js/birds_ingested.js` sidecar, which `getAllBirds()` merges into
the daily pool. Idempotent — already-in-pool ids are skipped. Read the printed summary:
`ok` / `excluded (no audio)` / `fail (couldn't resolve)`. Retry fails with better names.

## 3. Media (run unattended)
```bash
.venv/Scripts/python.exe scripts/run_mass.py
```
Generates audio + silhouettes + credits for the new ids (skips done ones). **Wikimedia
429-throttles at volume** — the stages back off and the run is resumable, so re-run to fill
gaps. If a silhouette keeps 429ing, its `imageUrl` may be a full-res original: rewrite to a
`/thumb/.../960px-FILE` URL (cached, not throttled) and re-run `make_silhouette --overwrite`.

## 4. Clue text + facts (Sonnet agents, you review)
The only non-fetchable part. See `birdle-write-clues`. Briefly:
```bash
.venv/Scripts/python.exe scripts/make_clue_batches.py --size 60   # assignment files
# spawn one Sonnet agent per scripts/clues_batches/batchNN.txt -> scripts/clues/batchNN.json
.venv/Scripts/python.exe scripts/apply_clues.py                   # spoiler-check + merge
# facts: agents -> scripts/facts/batchNN.json ; apply_facts.py
```

## 5. Verify
```bash
.venv/Scripts/python.exe scripts/lint_data.py     # integrity + coverage (audio/silhouette/clue/facts)
.venv/Scripts/python.exe test_birdle.py           # 4 Playwright tests, reads daily bird live
```
Target: audio + clues + facts at 100% of ingested; silhouettes ≥ ~98% (generic SVG fallback
covers the rest). Lint also lists no-audio exclusions and any missing media.

## Data-quality gotcha
Short/ambiguous common names can resolve to the WRONG Wikipedia article (wrong photo, source,
even audio). The clue/facts agents often catch these by noticing the source describes the
wrong subject. Fix with `scripts/fix_birds.py` (re-resolves image/source/family from an
explicit scientific name + page title), then regenerate that bird's media + clues + facts.
