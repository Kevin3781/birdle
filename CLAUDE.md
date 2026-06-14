# Birdle — Agent Implementation Brief

This file is the single source of truth for implementing the redesign spec. Read it completely before touching any code. All decisions recorded here reflect the current conversation context and supersede any assumptions you might derive from the code alone.

---

## What Birdle is

A Wordle-style daily bird-guessing game at `C:\src\birdle`. Vanilla HTML/CSS/JS — no build step, no bundler, no npm. Open `index.html` directly in a browser, or serve it (the test suite does this automatically on port 8743). Every day the same bird appears for all players, seeded by date.

---

## Tech stack

- **HTML/CSS/JS** — single page, no framework, no transpilation
- **Fonts** — Playfair Display (headings) + DM Sans (body) from Google Fonts, loaded async via `media="print" onload="this.media='all'"`
- **Design** — flat/square corners everywhere: all `--r-*` CSS custom properties are `0px`. Keep this.
- **Persistence** — `localStorage` only. No server, no database.
- **Tests** — Python Playwright (`playwright.sync_api`). Run: `python C:/src/birdle/test_birdle.py`
- **Test server** — starts automatically on port 8743, serves `C:/src/birdle`

---

## File inventory (current state)

| File | Status | Notes |
|---|---|---|
| `index.html` | **Replace entirely** | Current layout: header → loading screen → location screen (practice) → game screen → overlays (bird card, stats, help). All must be rebuilt for hub-and-spoke. |
| `css/styles.css` | **Replace entirely** | Hub-and-spoke requires a full layout rewrite. Keep the flat/square corner variable values. |
| `js/birds.js` | **Modify** | Add `silhouetteType` field, `getAllBirds()` function, `getDailyBirdForOffset(n)` function. Pool consolidation happens here. |
| `js/ui.js` | **Replace entirely** | Current: zoom levels, hint stack, photo frame. New: spoke rendering, hub layout. |
| `js/app.js` | **Replace entirely** | Remove practice/location logic, add archive mode, replace dual-channel (zoom+hints) with single `unlockedClueCount`. |
| `js/location.js` | **Delete entirely** | Nominatim geocoding. No longer needed. |
| `test_birdle.py` | **Rewrite** | Remove practice test, add archive + spoke-unlock tests. |

---

## Current design tokens (preserve these)

```css
:root {
  --r-sm: 0px; --r-md: 0px; --r-lg: 0px; --r-xl: 0px; --r-pill: 0px;
  /* Colors — verify from styles.css, but roughly: */
  --bg: #1a1a1a (dark);
  --bg-card: #242424;
  --accent: #d4782a (warm orange);
  --text: #e8e0d5;
  --text-muted: #8a7f76;
}
```

Cursor spotlight: the `.game-card` background is a `radial-gradient` updated via `--mx`/`--my` CSS custom properties on mousemove. **Do not tilt the `.game-card` or any parent that contains interactive children** — this broke Playwright tests in the previous implementation because CSS `transform` shifts bounding boxes and causes click misses on autocomplete items. 3D tilt is only safe on the `.photo-frame` (which has no interactive children). In the new hub-and-spoke layout, apply tilt only to non-interactive spoke panels (silhouette spoke, photo spoke).

---

## Redesign spec — full summary

The spec file is at `C:\Users\Kevin\Downloads\birdle-redesign-spec.md`. The summary below is complete enough to implement from without re-reading the spec, but the spec is the authority if anything conflicts.

### Core change: 5 fixed clue slots

Replace zoom-progression + sequential hint-unlock with **5 clue slots**, driven by a single integer `unlockedClueCount` (starts at 1). Each wrong guess increments it by 1 (max 5). On win or game-over, reveal all remaining slots.

**Clue order (locked in — implement as-is):**
1. **Bird song** — unlocked by default (unlockedClueCount = 1 from the start)
2. **Habitat / range** — unlocked after wrong guess 1
3. **Behaviour / diet** — unlocked after wrong guess 2
4. **Silhouette** — unlocked after wrong guess 3
5. **Full photo** — unlocked after wrong guess 4

The existing "size" hint is dropped. Silhouette conveys size + shape together.

### Hub-and-spoke layout

- **Hub** (center): the guess input + autocomplete dropdown, always active
- **Spokes** (5, arranged around the hub in a pentagon): one per clue. Locked spokes show a placeholder (e.g. "?" or dimmed icon). Unlocked spokes show content: audio player, text, silhouette SVG, photo.
- Design the spokes themselves as the flat/square card elements — this is the destination for the in-progress flat/square redesign, not a layer on top.

### Mode changes

**Remove entirely:**
- Practice mode (all UI, routes, and game-loop branch)
- `location.js` and all Nominatim calls
- Regional pool data structures in `birds.js` (pool selection logic — the underlying region tag data on each bird is cheap to keep for potential future use)
- `screen-location` HTML, all location-input wiring in `app.js`
- Old photo-zoom logic (`setZoom`, `ZOOM_LEVELS`, zoom pips, zoom badge)
- Old sequential hint-unlock logic (`HINT_SEQUENCE`, `revealHint`)

**Add: Archive mode**
- Shows 5 most recently completed daily birds: yesterday (offset -1) through 5 days ago (offset -5). Today's bird is NOT shown (preserves daily stakes).
- Reuses the date-seeded selection function with a day offset. No new storage needed.
- Picker UI lists by date label only ("Yesterday", "2 days ago" … "5 days ago") — does NOT name the bird (spoiler prevention).
- Playing an archive entry uses the same 5-clue/hub-and-spoke flow as Daily.
- **Archive plays write nothing to stats** — streak, win%, distribution are Daily only. Enforce this explicitly; test it.

### Shareable result

Add a Wordle-style share button (on the bird reveal card) producing:
- 5-segment wheel or row, filled to the solve point (unfilled/X on fail)
- Text: `Birdle [date] — solved on clue N/5` (or `X/5` on fail)
- No bird name in the shared output
- Uses the Web Share API with clipboard fallback

### Stats

- "Guess distribution" bins are now clue-1 through clue-5 (which spoke unlocked the solve) plus fail
- Daily mode only
- Archive plays must not touch `localStorage['birdle_stats']`

### Onboarding

Update the help modal (`#overlay-help`) to describe:
- Hub-and-spoke layout
- Song available immediately (clue 1), full photo is clue 5
- Clue order (song → habitat → behaviour → silhouette → photo)
- Archive mode location and that it doesn't affect stats

---

## Silhouette system

Create **14 reusable SVG body-type silhouettes** in `svg/silhouettes/`. Name the files to match the type keys below. Each SVG should be a solid-color path (use CSS `fill: currentColor` so the color can be controlled from CSS). Size at approximately 200×200 viewBox.

### Silhouette types

| Type key | Description | Example birds |
|---|---|---|
| `passerine` | Small perching songbird | robin, tit, goldfinch, bunting, blackbird, sparrow, meadowlark |
| `corvid` | Medium crow/jay — larger than passerine, upright | blue-jay, eurasian-jay |
| `raptor` | Hawk/eagle — broad wings, hooked bill | bald-eagle, red-tailed-hawk, harpy-eagle, wedge-tailed-eagle, osprey, african-fish-eagle |
| `owl` | Round-headed owl body | snowy-owl, barn-owl, great-horned-owl |
| `waterfowl` | Duck/goose — low, flat body on water | mallard, wood-duck, mandarin-duck, canada-goose |
| `wading-bird` | Long-legged, long-necked tall wader | greater-flamingo, white-stork, red-crowned-crane |
| `penguin` | Upright, flipper-winged | emperor-penguin |
| `seabird-compact` | Puffin/booby — compact diving seabird | atlantic-puffin, blue-footed-booby |
| `tern-gull` | Graceful, long-winged seabird | arctic-tern, black-headed-gull |
| `large-soaring` | Enormous wingspan, glider (albatross/condor) | wandering-albatross, andean-condor, california-condor |
| `hummingbird` | Tiny, hovering, needle bill | ruby-throated-hummingbird, annas-hummingbird |
| `parrot` | Hooked bill, upright, broad head | sulphur-crested-cockatoo, rainbow-lorikeet, scarlet-macaw |
| `kingfisher` | Stocky, large-billed, short tail | common-kingfisher, laughing-kookaburra, stork-billed-kingfisher, hoopoe, great-hornbill, oriental-dollarbird |
| `large-terrestrial` | Large ground bird — upright or running | emu, indian-peafowl, california-quail, keel-billed-toucan (seated body type), shoebill |

Add a `silhouetteType` field to every bird in `birds.js`. If a bird doesn't fit neatly, pick the closest type or add a 15th type if genuinely needed.

**Leave a TODO comment** near the silhouette loading code noting that a v2 enhancement could generate species-specific silhouettes from the Wikimedia photos via canvas-based thresholding — don't build it now.

### Silhouette MVP approach

For the MVP, the silhouettes don't need to be perfect anatomical illustrations — they need to convey body plan and relative size. A simple SVG path for each type is sufficient. The key constraint: the SVG must use `fill: currentColor` so CSS can control the color (e.g. a dark muted tone for locked spoke, accent color for unlocked).

---

## Bird pool

**Current state:**
- `GLOBAL_POOL`: 26 birds (indices 0–25)
- `REGIONAL_BIRDS` buckets: north-america (5), california (5), europe (5), africa (5), asia (5), south-america (5), australia (5)
- Total unique birds: ~61

**What to do:**
1. Merge all birds into a single pool. The simplest approach: flatten `GLOBAL_POOL` + all `REGIONAL_BIRDS` values into one array, deduplicating by `id`. Remove the `REGIONAL_BIRDS` object and `getPool()` function.
2. Add `getAllBirds()` returning the single flat array.
3. Keep the `regions` field on each bird for potential future use (the spec explicitly says don't delete it if it's cheap to keep).
4. Remove `globalPool: true` field — no longer meaningful with one pool.
5. Add `silhouetteType` to every entry (see above).
6. `getDailyBird()` uses the full merged pool length. Update the formula.
7. Add `getDailyBirdForOffset(daysAgo)` — same date-seed logic but subtracts `daysAgo` from today before computing the index. Used by Archive mode.

**After changing pool size, recalculate the daily bird for the test:**
```python
from datetime import date
epoch = date(2025, 1, 1)
today = date(2026, 6, 13)   # adjust to actual run date
day_idx = (today - epoch).days
pool_size = <new merged pool length>
print(day_idx % pool_size)   # that index in the new pool = daily bird
```
Update `DAILY_BIRD` in `test_birdle.py` to match.

**Data integrity note:** A previous summary flagged a possible id/commonName mismatch in the California regional birds. The current file appears correct (verified by reading it), but double-check all entries during the consolidation pass — compare each `id` against its `commonName` to ensure they match.

---

## `localStorage` keys in use

| Key | Purpose |
|---|---|
| `birdle_YYYY-MM-DD` | Daily game progress for that date. Format: `{birdId, guesses, wrongCount, gameOver, won}` |
| `birdle_stats` | Cumulative stats. Format: `{played, wins, streak, maxStreak, dist[6]}`. dist[0..4] = solved on clue 1..5; dist[5] = fail. |
| `birdle_seen_help` | First-run flag. Set to `'1'` after user closes help modal. |

Archive plays must not write to any of these keys.

---

## Test infrastructure

**Run tests:**
```
cd C:/src/birdle && python test_birdle.py
```

The test script:
- Starts an HTTP server on port 8743 serving `C:/src/birdle`
- Uses `page.add_init_script("localStorage.setItem('birdle_seen_help', '1')")` to suppress the first-run modal — keep this
- Writes screenshots to `C:/src/birdle/screenshots/`
- Currently has 3 tests: help modal, daily mode, practice mode

**After the redesign, the test suite needs:**
- Remove: practice test (including Nominatim/location flow)
- Add: spoke unlock sequence test (1 spoke open by default, +1 per wrong guess)
- Add: full reveal on win (all spokes open, bird name shown)
- Add: full reveal on game-over (5 failed guesses → all spokes reveal)
- Add: archive mode test (5 entries shown, no bird names in picker, playing an entry doesn't write stats)
- Add: share output test (correct segment count, no species name in output string)

**Critical Playwright gotcha:** Never apply CSS `transform` (including 3D tilt) to any element that is an ancestor of an interactive child (autocomplete dropdown, buttons). Playwright calculates click target coordinates, then moves the mouse (which may trigger a transform), then clicks at the original coordinates — the transform shifts the DOM elements, causing the click to miss. Only tilt non-interactive spoke panels.

---

## Available project skills (slash commands)

After implementing, use these to verify the work:

- `/birdle-test` — runs the full Playwright test suite and sends screenshots. Use this after every significant change.
- `/birdle-playtest` — spawns an antagonistic play-tester agent that scores the game across 5 categories (Bird variety, Interaction depth, UI, Onboarding, Replay value). Target: 9.0/10 average.
- `/birdle-add-birds` — full workflow for adding new birds with validated Wikimedia image URLs, correct field ordering, and test index recalculation.

---

## Implementation order

Follow this order — each step produces a runnable game state that can be tested:

1. **Core restructure** — replace `unlockedClueCount` for dual-channel (zoom + hints). 5 clue slots, new order. Keep existing flat HTML layout temporarily; just change the logic. Tests: spoke count, default state.

2. **Hub-and-spoke layout** — rebuild `index.html` and `css/styles.css` for the pentagon hub layout. Integrate with the in-progress flat/square corner redesign — the spokes are the flat cards. Update cursor interaction: spotlight on hub (`.game-hub`), 3D tilt only on the silhouette and photo spokes.

3. **Silhouette assets + integration** — create the 14 SVGs in `svg/silhouettes/`, add `silhouetteType` to `birds.js`, render silhouette spoke from the SVG.

4. **Mode changes** — remove Practice mode, `location.js`, and all location UI. Add Archive mode (picker + game flow). Enforce stats isolation.

5. **Bird pool consolidation** — merge pools, add `getAllBirds()` and `getDailyBirdForOffset()`, remove `getPool()` and `REGIONAL_BIRDS`. Add `silhouetteType` to all remaining birds (if not done in step 3). Recalculate daily bird index.

6. **Sharing + stats integration** — share button with 5-segment output, update stats distribution to clue-1..5 bins.

7. **Onboarding update** — rewrite help modal content for new clue order and Archive.

8. **Test suite** — rewrite `test_birdle.py` to cover new flows, remove old tests.

9. **Code removal checklist** — verify everything from spec section 9 is gone.

---

## What NOT to change

- Font loading strategy (async with `media="print"` trick — this is intentional)
- Autocomplete mechanism (input → search → dropdown → select → submit) — it works and the Playwright tests depend on the exact DOM IDs (`#guess-input`, `#guess-suggestions`, `#btn-guess`)
- Date-seeding formula for daily bird (`Math.floor((today - epoch) / 86400000) % pool.length`)
- The bird data schema fields that remain relevant: `id`, `commonName`, `scientificName`, `regions`, `imageUrl`, `audioUrl`, `xenoCantoQuery`, `focalPoint`, `facts`, `hints`, `funFact`, `ebirdUrl`, `audubonUrl`
- Wikimedia image URL format — always validate via the Wikimedia API before adding new birds (see `/birdle-add-birds` skill)
