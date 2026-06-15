---
name: birdle-write-clues
description: Generate Birdle clue text (habitat/behaviour/fun-fact) and reveal-card facts for ingested birds using batched Sonnet subagents with an automated spoiler-checker. Use after ingesting birds, or to rewrite flagged/low-quality clues.
---

Generates the only part of a bird that can't be fetched: the written clue + card text. Uses
**Sonnet subagents (you, the parent, review)** — the standing rule for this project. Runs in
the repo venv.

## What the game renders (only these)
- `hints.region` → **Clue 2** ("Habitat / range") — shown BEFORE the guess
- `hints.behavior` → **Clue 3** ("Behaviour / diet") — shown BEFORE the guess
- `funFact` → reveal card (after the guess)
- `facts.{size,habitat,diet,migration}` → reveal-card block (after the guess)

Don't write other fields. region/behavior are guess-time, so they must NOT contain the bird's
common name or any scientific-name word (spoilers). funFact + facts.* may name the bird.

## Clue text workflow
1. **Batch** the birds needing clues into per-agent assignment files:
   ```bash
   .venv/Scripts/python.exe scripts/make_clue_batches.py --size 60
   ```
   Each `scripts/clues_batches/batchNN.txt` lists ids + source paths + per-bird **forbidden
   words** (computed from the common + scientific names).
2. **Spawn one Sonnet agent per batch file.** Tell each to read its batch file, read each
   `scripts/sources/<id>.txt`, and emit `scripts/clues/batchNN.json`:
   `{ "<id>": { "region":"...", "behavior":"...", "funFact":"..." }, ... }`.
   Stress: never use a forbidden word in region/behavior; refer to the bird as "this bird";
   ground everything in the source; vary sentence openings; keep it tight.
3. **Merge + spoiler-check:**
   ```bash
   .venv/Scripts/python.exe scripts/apply_clues.py --check-only   # validate
   .venv/Scripts/python.exe scripts/apply_clues.py                # apply clean ones
   ```
   The checker flags any region/behavior containing a name word (incl. group words like
   "crane"/"ibis"/"woodpecker" and geographic adjectives like "indian"/"andean"). Re-run the
   flagged ids through one more agent with their explicit forbidden lists until **0 flags**.
   Watch for substring traps: "falconry" trips `falco`, "mistletoe" trips `mistle`.

## Facts workflow (reveal card)
Reuse the same batch files (ignore the forbidden lines — facts are post-reveal). Agents emit
`scripts/facts/batchNN.json` `{ "<id>": { "size","habitat","diet","migration" } }`; merge with
`scripts/apply_facts.py`. Keep `size` to source-grounded numbers or a relative description.

## Notes
- Agents writing the same file collide; give each its own `batchNN.json`.
- If a session/usage limit hits mid-run, agents usually finish their file first — check
  `scripts/clues/` / `scripts/facts/` for valid JSON before re-spawning.
- Coverage check: `apply_clues.py` / `apply_facts.py` print `N/total` ingested with text.
