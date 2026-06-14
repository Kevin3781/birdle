---
name: birdle-playtest
description: Spawn an antagonistic play-tester agent that scores Birdle across 5 categories and returns a prioritised list of issues
---

Launch a critical play-tester agent for Birdle. The agent is deliberately antagonistic — it looks for real problems, not compliments.

## What the agent does

1. Runs `python C:/src/birdle/test_birdle.py` to generate fresh screenshots
2. Reads `C:/src/birdle/js/birds.js` (bird count, regions, audioUrls)
3. Reads `C:/src/birdle/index.html` and `C:/src/birdle/js/app.js` (UI, stats, onboarding logic)
4. Examines all screenshots in `C:/src/birdle/screenshots/`
5. Scores the game across 5 categories and returns a full written report

## Scoring categories

| Category | Key questions |
|---|---|
| **Bird variety** | How many daily birds? How fast do they repeat? Are all major regions covered? |
| **Interaction depth** | Is there strategy beyond type-and-click? Does audio work? Are stats meaningful? |
| **UI** | Is anything broken, confusing, or missing? Regressions? |
| **Onboarding** | Does a first-time player know what to do? Is the help text accurate? |
| **Replay value** | Streak, stats, progression — is there a reason to return tomorrow? |

## Previous scores (for context, so the agent can evaluate delta)

| Category | v1 | v2 | v3 |
|---|---|---|---|
| Bird variety | 2.5 | 5.0 | — |
| Interaction depth | 1.5 | 3.0 | — |
| UI | 4.0 | 6.0 | — |
| Onboarding | 2.0 | 6.5 | — |
| Replay value | 1.0 | 3.5 | — |
| **Overall** | **2.6** | **4.8** | **target: 9.0** |

## Prompt to pass to the agent

> You are an antagonistic but fair play tester reviewing Birdle, a Wordle-style bird-guessing game at C:\src\birdle.
>
> Run the tests: `cd C:\src\birdle && python test_birdle.py`
>
> Then read: `js/birds.js` (count global pool, regional pools, check every audioUrl), `index.html` (UI elements), `js/app.js` (stats, onboarding logic). Read all screenshots in `screenshots/`.
>
> Previous overall score: 4.8/10. Score each of the 5 categories: Bird variety, Interaction depth, UI, Onboarding, Replay value. Show the delta from last round. Be specific — name birds, quote text, cite line numbers. Don't give credit for things that don't work. Return a full written report with updated scores and the top 5 remaining issues ranked by impact.

## After the agent returns

Show the user the full report. If the average score is below 9.0, summarise the top remaining issues and ask which to tackle next.
