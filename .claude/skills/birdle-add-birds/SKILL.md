---
name: birdle-add-birds
description: Add new birds to the Birdle pool with validated Wikimedia image URLs, a silhouetteType, then run the audio + silhouette media pipelines. Single merged pool; updates the daily-bird-aware test.
---

Full workflow for adding birds to `C:/src/birdle/js/birds.js` and generating their
local media. Since the redesign there is **one merged pool** (no regional buckets,
no `globalPool` flag) and media (audio + silhouette) is produced by Python pipelines
into `js/media.js`.

> **Adding many birds (dozens+)?** Use `birdle-ingest-birds` instead — it resolves
> scientific name + image + family + clue-source text from APIs (no hand-typed URLs),
> audio-gates, and drives clue/facts generation at scale. This skill is for adding one
> or a few birds by hand into the curated `birds.js`. (All Python runs in the repo
> `.venv` — never global.)

## 1. Bird data schema

Add entries to the `GLOBAL_POOL` array (the only pool now). Match existing entries:

```js
{
  id: 'kebab-case-unique-id',
  commonName: 'Common Name',
  scientificName: 'Genus species',
  regions: ['africa'],            // kept for future use; not used for selection
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/X/XX/File.jpg/960px-File.jpg',
  audioUrl: '',                   // legacy; leave '' — audio comes from the pipeline
  xenoCantoQuery: 'Genus species',
  focalPoint: { x: 0.5, y: 0.4 },
  facts:  { size: '', habitat: '', diet: '', migration: '' },
  hints:  { region: '', size: '', behavior: '' },   // region = clue 2, behavior = clue 3
  funFact: '',
  ebirdUrl: 'https://ebird.org/species/XXXXXX',
  audubonUrl: '',
},
```

Then map the bird's `id` to a body-type in `SILHOUETTE_BY_ID` (near the bottom of
`birds.js`). Types: passerine, corvid, raptor, owl, waterfowl, wading-bird, penguin,
seabird-compact, tern-gull, large-soaring, hummingbird, parrot, kingfisher,
large-terrestrial. This is the **fallback**; the silhouette pipeline will generate a
per-species image that overrides it.

## 2. Validate the image URL (critical)

Never guess Wikimedia URLs. Validate via the API and use the returned `thumburl`:

```
https://en.wikipedia.org/w/api.php?action=query&titles=File:FILENAME.jpg&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json
```

## 3. Generate media

```bash
python scripts/fetch_audio.py    --ids <new-id-1>,<new-id-2>     # /birdle-fetch-audio
python scripts/make_silhouette.py --ids <new-id-1>,<new-id-2>    # /birdle-make-silhouette
python scripts/fetch_credits.py   --ids <new-id-1>,<new-id-2>    # photo attribution
```
(For a full pool refresh, just run `python scripts/run_mass.py` — it does all three
over every bird, idempotently.)
- Audio: hybrid iNaturalist → Xeno-canto (set `XENO_CANTO_KEY` for the fallback).
  Birds with no open recording get the neutral empty-state — that's fine.
- Silhouette: rembg isolation → black PNG. **Visually QA each output** (Read the
  image); retry `--model u2net` or flag for a better photo if the matte is poor.

Both commands update `js/media.js`. For mass batches, dispatch **sonnet** subagents
per chunk with you reviewing (see the two media skills).

## 4. Update the test

The merged pool size changes the date-seeded daily bird. `test_birdle.py` now reads
the daily bird **live** from the app (`daily_name(page)` / `Birds.getDailyBird()`),
so there's usually nothing to hardcode. Just confirm:
- the merge order in `birds.js` is unchanged (GLOBAL_POOL then regional buckets), and
- `WRONG_CANDIDATES` in the test still excludes nothing it shouldn't.

Run `/birdle-test` — all flows should pass with no JS console errors.

## Pilot before mass production

Always run the full pipeline on **one** bird first (the Shoebill is the reference
pilot: clean silhouette, audio empty-state demonstrated) before batching the rest.

## Common mistakes

- Don't add a bird already in the file (`id` must be unique across the pool).
- Don't use an unvalidated Wikimedia URL — 400/404 images break the game.
- Don't ship a garbled silhouette — a bad matte is worse than the generic fallback.
- Don't reintroduce in-game Xeno-canto query links — they spoil the answer.
