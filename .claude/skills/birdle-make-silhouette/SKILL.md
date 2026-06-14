---
name: birdle-make-silhouette
description: Generate per-species black silhouettes for Birdle by isolating the bird in its photo with rembg, masking it out, and filling it black. Batchable, with an agent-driven visual-QA loop for mass production.
---

Run the **silhouette pipeline** that turns each bird's photo into a clean
per-species black silhouette for clue 4. Replaces the generic body-type SVGs.

## One-time setup

```bash
pip install -r scripts/requirements.txt   # rembg[cpu] + pillow
```
First run downloads the U²-Net model (~170 MB) into `~/.u2net/`.

## Run it

```bash
python scripts/make_silhouette.py --ids shoebill
python scripts/make_silhouette.py --all                  # mass run
python scripts/make_silhouette.py --all --overwrite
python scripts/make_silhouette.py --ids harpy-eagle --model u2net   # alternate model
```

## What it does (per bird)

1. download the Wikimedia photo (`imageUrl` from `birds.js`)
2. isolate the bird with **rembg** (U²-Net → alpha matte)
3. threshold the alpha, paint the subject **solid black** on transparent
4. autocrop to the subject + pad → `svg/silhouettes/species/<id>.png`
5. record the path in `js/media.js` (`"silhouette": "svg/silhouettes/species/<id>.png"`)

The game prefers this per-species PNG and falls back to the generic body-type SVG
(`svg/silhouettes/<silhouetteType>.svg`) when none exists. Both render as `<img>`
so they load reliably over `file://` and `http://`.

## Agent-driven visual-QA loop (IMPORTANT for mass production)

rembg is good but not perfect — perches, branches, water reflections, or a second
bird can leak into the matte. For mass runs, dispatch **sonnet** subagents over
chunks of ids; each subagent must:

1. run `python scripts/make_silhouette.py --ids <chunk> --overwrite`
2. **open and look at** each `svg/silhouettes/species/<id>.png` (Read the image)
3. judge: is it a single, clean, recognizable bird silhouette?
4. if poor, retry with `--model u2net` (or `--model birefnet-general`); if still
   poor, flag the bird for a better source photo (note it; don't ship a bad matte)
5. report a per-bird PASS / RETRY / FLAG table

You (the orchestrator) **review** the reports and decide on flagged birds. Never
mass-ship silhouettes without the visual check — a wrong/garbled silhouette is a
worse clue than the generic fallback.

## Quality knobs

- `--model`: `isnet-general-use` (default), `u2net`, `birefnet-general`
- `ALPHA_THRESHOLD` / `PAD_FRAC` constants in `scripts/make_silhouette.py`
- A good matte reports a sensible "subject N% of frame" (roughly 8–60%); &lt;2% or
  near-100% usually means a failed isolation.

## Verify

`/birdle-test`, then unlock clue 4 in-game and confirm the silhouette reads as the
right bird (Read the screenshot). The Shoebill pilot
(`svg/silhouettes/species/shoebill.png`) is the reference for "good".
