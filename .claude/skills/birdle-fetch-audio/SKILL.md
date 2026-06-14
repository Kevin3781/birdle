---
name: birdle-fetch-audio
description: Download open-licensed bird-call recordings into local files so the game can embed audio without revealing the answer via a query string. Hybrid iNaturalist + Xeno-canto pipeline, batchable.
---

Run the **audio pipeline** that populates local recordings and the generated
`js/media.js` map. Stdlib-only — **no pip install required**.

Why this exists: the old in-game "Listen on Xeno-canto" link put the bird's
scientific name in the URL — a spoiler. The pipeline downloads a clip to
`audio/<id>.<ext>` and the game embeds it locally instead.

## Run it

```bash
# one or a few birds
python scripts/fetch_audio.py --ids shoebill,american-robin

# everything (mass run)
python scripts/fetch_audio.py --all

# re-download / cap
python scripts/fetch_audio.py --all --overwrite
python scripts/fetch_audio.py --all --limit 10

# enable the Xeno-canto v3 fallback (better coverage, incl. non-vocal species)
XENO_CANTO_KEY=<key> python scripts/fetch_audio.py --ids shoebill
```

## Source order (hybrid)

1. **iNaturalist** — keyless, CC-licensed. Prefers compressed formats (mp3/m4a)
   over wav to keep payloads small. Great for vocal birds.
2. **Xeno-canto v3** — used only when a key is available (env `XENO_CANTO_KEY`, or a
   file at `~/.birdle/xeno_canto_key` / `scripts/.xeno_canto_key`, both kept out of
   the repo). NOTE: v3 only accepts **tag queries**, so the pipeline searches
   `gen:<Genus> sp:<species>` — not free text.

Birds with no open recording get `audio: false` in `media.js`; the game then shows
a neutral "No recording available" state in the song spoke — **never** a spoiler
link. (The Shoebill is the canonical example — it has NO recording on iNaturalist
*or* Xeno-canto, because it doesn't vocalize.)

## Manual override (hand-picked, you-cleared clips)

Only CC sources are used automatically. For a gap you want to fill with a specific
clip you have the rights to self-host, use:

```bash
python scripts/fetch_audio.py --ids shoebill \
  --manual-url "https://macaulaylibrary.org/asset/2284" \
  --attribution "Macaulay Library asset 2284 — <recordist>, educational use"
```

Accepts a direct file URL or a `macaulaylibrary.org/asset/<id>` link (auto-resolved
to its CDN audio URL). **Licensing is your call:** Macaulay Library media is
copyrighted (mostly All-Rights-Reserved) and licensed for personal/non-commercial/
educational use — redistribution/self-hosting needs permission. Do not wire ML into
the automated `--all` runs.

## Output: js/media.js

```js
const BirdMedia = {
  "american-robin": { "audio": "audio/american-robin.m4a", "audioAttribution": "iNaturalist (c) ..., CC-BY-NC — observation 153438595" },
  "shoebill":       { "audio": false, "audioAttribution": false }
};
```

Attribution is recorded per clip (licenses are CC-BY-NC etc.) — keep the
"educational use only" footer credit accurate.

## Mass production (sonnet subagents, you as reviewer)

For large batches, dispatch **sonnet** subagents over chunks of bird ids
(`--ids a,b,c`), each running the script and reporting which birds came back empty.
Review the empty list and decide per bird whether to (a) accept the empty-state,
or (b) supply `XENO_CANTO_KEY` and re-run those ids.

## Verify

`/birdle-test` then spot-check: the song spoke must show an `<audio>` player (or the
neutral empty state) and must contain **no** species name anywhere in the DOM/URL.
