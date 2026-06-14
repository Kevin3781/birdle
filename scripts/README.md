# Birdle media pipelines

Reusable Python tools that populate **local** media so the game never reveals the
answer through a query string. Both write a generated map, `js/media.js`:

```js
const BirdMedia = {
  "shoebill": { "audio": false, "silhouette": "svg/silhouettes/species/shoebill.png", ... },
  "american-robin": { "audio": "audio/american-robin.m4a", "audioAttribution": "...", "silhouette": "..." }
};
```

`media.js` is a plain `<script>` (no `fetch`), so the game still works when
`index.html` is opened directly via `file://`.

## Audio — `fetch_audio.py` (stdlib only, no install)

Hybrid source order: **iNaturalist** (keyless, CC) → **Xeno-canto v3** (only if
`XENO_CANTO_KEY` is set). Birds with no open recording get `audio: false`, and the
game shows a neutral "no recording available" state — never a spoiler link.

```bash
python scripts/fetch_audio.py --ids shoebill,american-robin
python scripts/fetch_audio.py --all                  # mass run
python scripts/fetch_audio.py --all --overwrite
XENO_CANTO_KEY=xxxx python scripts/fetch_audio.py --ids shoebill   # enable XC fallback
```

## Silhouette — `make_silhouette.py`

Downloads the photo, isolates the bird with **rembg** (U²-Net), paints it solid
black on transparent, autocrops, and saves `svg/silhouettes/species/<id>.png`.

```bash
pip install -r scripts/requirements.txt   # first time (downloads ~170MB model on first run)
python scripts/make_silhouette.py --ids shoebill
python scripts/make_silhouette.py --all                 # mass run
python scripts/make_silhouette.py --ids shoebill --model u2net   # alternate model
```

The game prefers the per-species silhouette and falls back to the generic
body-type SVG (`svg/silhouettes/<silhouetteType>.svg`) when none exists.

## Credits — `fetch_credits.py`

Pulls each photo's author + license + file-page from the Wikimedia Commons API into
`js/media.js` (`imageArtist`, `imageLicense`, `imageLicenseUrl`, `imageSource`). The
game surfaces these in the footer **Credits** modal and on each reveal card — needed
for CC-BY / CC-BY-SA compliance when hosting.

```bash
python scripts/fetch_credits.py --all
```

## Mass run — `run_mass.py` (run this yourself, unattended)

One command runs the whole pipeline over all birds, idempotent (safe to re-run to
resume). Reads the Xeno-canto key from `~/.birdle/xeno_canto_key` automatically.

```bash
python scripts/run_mass.py --dry-run    # print the 61-bird queue + plan, do nothing
python scripts/run_mass.py              # validate -> audio -> silhouettes -> credits -> lint
python scripts/run_mass.py --overwrite  # force regenerate everything
```
The queue is written to `scripts/mass_queue.txt`. Expect a few minutes (rembg runs
per photo). When it finishes, the lint report lists any birds with **no open audio**
(your "exclude" candidates) and anything still missing a silhouette.

## Checks — `lint_data.py` + `validate_images.py` (see `/birdle-check`)

Deterministic checks that replace manual review:

```bash
python scripts/lint_data.py            # data integrity + media coverage (offline)
python scripts/lint_data.py --strict   # exit 1 on problems (CI/pre-commit)
python scripts/validate_images.py      # every imageUrl returns 200 + image type
```

## Agent-driven quality loop

For mass production, run a per-bird agent that: runs the script, **views** the
output silhouette, and re-runs with `--overwrite --model u2net` (or flags the bird
for a manual photo swap) when the matte is poor. See the `birdle-make-silhouette`
and `birdle-add-birds` skills.
