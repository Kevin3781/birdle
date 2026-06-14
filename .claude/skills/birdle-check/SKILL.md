---
name: birdle-check
description: Run Birdle's deterministic Python checks — data integrity lint, media-coverage report, and image-URL validation — instead of eyeballing the dataset by hand.
---

Fast, offline-first checks that replace manual review. Use after editing `birds.js`
or running the media pipelines, and before shipping/mass production.

## Data + media lint (offline, instant)

```bash
python scripts/lint_data.py            # report
python scripts/lint_data.py --strict   # exit 1 on any problem (CI/pre-commit)
```
Flags: duplicate ids, empty/missing clue text (`hints.region`, `hints.behavior`),
missing/invalid `silhouetteType`, missing `imageUrl`. Also prints media coverage:
how many birds have audio / a species silhouette, which birds are **audio = none**
(excluded under the "no open audio" policy), and which still need a silhouette.

## Image-URL validation (network)

```bash
python scripts/validate_images.py             # all birds
python scripts/validate_images.py --ids a,b   # subset
```
Checks every `imageUrl` returns HTTP 200 + an image content-type (threaded). Exits
non-zero if any are broken — run this instead of manually hitting the Wikimedia API
per bird.

## Typical flow when adding/QA-ing birds

```bash
python scripts/validate_images.py            # are the photos live?
python scripts/lint_data.py                  # data complete? what media is missing?
# ...then the media pipelines for whatever lint says is missing...
/birdle-test                                 # behaviour still green?
```
