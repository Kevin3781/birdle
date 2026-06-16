/* app.js — Game state and logic (hub-and-spoke, Daily + Archive) */

const App = (() => {
  const MAX_GUESSES = 5;

  let state = {
    mode: 'daily',          // 'daily' | 'archive'
    bird: null,             // current bird
    pool: [],               // autocomplete pool (full merged list)
    guesses: [],            // [{ text, correct }]
    wrongCount: 0,
    unlockedClueCount: 1,   // 1–5; clue 1 (song) is free, +1 per wrong guess
    gameOver: false,
    won: false,
    archiveOffset: 0,       // days ago (archive mode only)
  };

  // ── Stats (daily mode only) ───────────────────────────────────────────────
  function getStats() {
    try {
      return JSON.parse(localStorage.getItem('birdle_stats') || 'null') ||
        { played: 0, wins: 0, streak: 0, maxStreak: 0, dist: [0, 0, 0, 0, 0, 0] };
    } catch (_) {
      return { played: 0, wins: 0, streak: 0, maxStreak: 0, dist: [0, 0, 0, 0, 0, 0] };
    }
  }

  function recordStats(won, guessCount) {
    if (state.mode !== 'daily') return; // Archive never touches stats
    const s = getStats();
    s.played++;
    if (won) {
      s.wins++;
      s.streak++;
      s.maxStreak = Math.max(s.maxStreak, s.streak);
      s.dist[guessCount - 1]++;       // solved on clue 1..5
    } else {
      s.streak = 0;
      s.dist[5]++;                     // fail
    }
    try { localStorage.setItem('birdle_stats', JSON.stringify(s)); } catch (_) {}
  }

  // ── Persistence (daily mode only) ─────────────────────────────────────────
  function todayKey() {
    const d = new Date();
    return `birdle_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function saveProgress() {
    if (state.mode !== 'daily') return; // Archive writes nothing
    const saved = {
      birdId: state.bird.id,
      guesses: state.guesses,
      wrongCount: state.wrongCount,
      gameOver: state.gameOver,
      won: state.won,
    };
    try { localStorage.setItem(todayKey(), JSON.stringify(saved)); } catch (_) {}
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(todayKey());
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  // ── Share text ──────────────────────────────────────────────────────────────
  function shareDateStr() {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function shareLineText() {
    const result = state.won ? `solved on clue ${state.guesses.length}/5` : 'X/5';
    return `Birdle ${shareDateStr()} — ${result}`;
  }

  function buildShareText() {
    const n = state.guesses.length;
    const segments = state.won
      ? '🟩'.repeat(n) + '⬜'.repeat(MAX_GUESSES - n)
      : '🟥'.repeat(MAX_GUESSES);
    return `${shareLineText()}\n${segments}\nhttps://birdle.app`;
  }

  // ── Start game ────────────────────────────────────────────────────────────
  function startGame(bird, mode, opts = {}) {
    state = {
      mode,
      bird,
      pool: Birds.getAllBirds(),
      guesses: [],
      wrongCount: 0,
      unlockedClueCount: 1,
      gameOver: false,
      won: false,
      archiveOffset: opts.archiveOffset || 0,
    };

    UI.showScreen('game');
    UI.setContext(mode, opts.archiveLabel);
    UI.renderSpokes(bird);
    UI.setUnlockedClues(1);
    UI.setGuessBadge(1);
    UI.clearGuessHistory();
    UI.clearGuessInput();
    UI.setGuessInputEnabled(true);
    UI.hideGuessSuggestions();
  }

  function startDailyGame(saved) {
    const bird = Birds.getDailyBird();
    startGame(bird, 'daily');
    if (saved && saved.birdId === bird.id) restoreProgress(saved);
  }

  function startArchiveGame(offset) {
    const bird = Birds.getDailyBirdForOffset(offset);
    startGame(bird, 'archive', { archiveOffset: offset, archiveLabel: archiveLabel(offset) });
  }

  // Dev/QA preview: ?bird=<id> plays any bird by id, archive-style (no stats, no
  // save). Lets you try a freshly-added bird's audio + silhouette on demand.
  function startPreviewGame(id) {
    const bird = Birds.getById(id);
    if (!bird) return false;
    startGame(bird, 'archive', { archiveLabel: `Preview — ${bird.commonName}` });
    return true;
  }

  function restoreProgress(saved) {
    state.guesses = saved.guesses;
    state.wrongCount = saved.wrongCount;
    state.gameOver = saved.gameOver;
    state.won = saved.won;
    state.unlockedClueCount = state.gameOver ? MAX_GUESSES : Math.min(1 + state.wrongCount, MAX_GUESSES);

    saved.guesses.forEach(g => UI.addGuessToHistory(g.text, g.correct, g.hint));
    UI.setUnlockedClues(state.unlockedClueCount);
    UI.setGuessBadge(Math.min(state.guesses.length + 1, MAX_GUESSES));

    if (state.gameOver) {
      UI.setGuessInputEnabled(false);
      setTimeout(() => openBirdCard(), 700);
    }
  }

  // ── Guess logic ───────────────────────────────────────────────────────────
  function submitGuess(rawText) {
    if (state.gameOver) return;
    const text = rawText.trim();
    if (!text) return;

    if (!Birds.isExactMatch(text, state.pool)) {
      UI.shakeGuessInput();
      UI.setGuessError('Not in the bird list — pick a suggestion from the dropdown.');
      return;
    }

    const correct = text.toLowerCase() === state.bird.commonName.toLowerCase();
    applyGuessResult(text, correct);

    const isGameOver = correct || state.guesses.length >= MAX_GUESSES;
    if (isGameOver) {
      state.gameOver = true;
      state.won = correct;
      state.unlockedClueCount = MAX_GUESSES; // reveal everything
      UI.setUnlockedClues(MAX_GUESSES);
      UI.setGuessInputEnabled(false);
      recordStats(correct, state.guesses.length);
    }

    saveProgress();

    if (isGameOver) setTimeout(() => openBirdCard(), 1200);
  }

  function applyGuessResult(text, correct) {
    // On a wrong guess, tell the player if they were close (right group/genus).
    const hint = correct ? null : Birds.closeness(text, state.bird, state.pool);
    state.guesses.push({ text, correct, hint });
    if (!correct) {
      state.wrongCount++;
      state.unlockedClueCount = Math.min(1 + state.wrongCount, MAX_GUESSES);
      UI.setUnlockedClues(state.unlockedClueCount);
    }
    UI.addGuessToHistory(text, correct, hint);
    UI.setGuessBadge(Math.min(state.guesses.length + 1, MAX_GUESSES));
  }

  // ── Bird card ─────────────────────────────────────────────────────────────
  function openBirdCard() {
    UI.showBirdCard({
      bird: state.bird,
      won: state.won,
      guessCount: state.guesses.length,
      mode: state.mode,
      shareText: buildShareText(),
      shareLine: shareLineText(),
    });
  }

  // ── Archive ───────────────────────────────────────────────────────────────
  function archiveLabel(offset) {
    return offset === 1 ? 'Yesterday' : `${offset} days ago`;
  }

  function archiveDateStr(offset) {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function showArchivePicker() {
    const entries = [];
    for (let offset = 1; offset <= 5; offset++) {
      entries.push({ offset, label: archiveLabel(offset), dateStr: archiveDateStr(offset) });
    }
    UI.renderArchivePicker(entries, startArchiveGame);
    UI.showScreen('archive');
  }

  // ── Event listeners ───────────────────────────────────────────────────────
  function setupGuessInput() {
    const input = document.getElementById('guess-input');
    const btn = document.getElementById('btn-guess');

    input.addEventListener('input', () => {
      const q = input.value;
      if (!q.trim()) { UI.hideGuessSuggestions(); return; }
      const matches = Birds.search(q, state.pool);
      UI.showGuessSuggestions(matches, (name) => {
        input.value = name;
        UI.hideGuessSuggestions();
      });
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); UI.navigateSuggestions(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); UI.navigateSuggestions(-1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const idx = UI.getActiveSuggestionIdx();
        if (idx >= 0) {
          document.querySelector('.suggestion-item--active')?.dispatchEvent(
            new MouseEvent('mousedown', { bubbles: true })
          );
        } else {
          submitGuess(input.value);
          UI.hideGuessSuggestions();
          input.value = '';
        }
      } else if (e.key === 'Escape') {
        UI.hideGuessSuggestions();
      }
    });

    input.addEventListener('blur', () => setTimeout(() => UI.hideGuessSuggestions(), 150));

    btn.addEventListener('click', () => {
      submitGuess(input.value);
      UI.hideGuessSuggestions();
      input.value = '';
    });
  }

  function setupModeTabs() {
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        document.querySelectorAll('.mode-tab').forEach(t => {
          t.classList.toggle('mode-tab--active', t === tab);
          t.setAttribute('aria-selected', String(t === tab));
        });
        if (mode === 'daily') startDailyGame(loadProgress());
        else showArchivePicker();
      });
    });
  }

  function setupCardButtons() {
    document.getElementById('btn-card-close').addEventListener('click', () => UI.hideBirdCard());
    document.getElementById('btn-card-next').addEventListener('click', () => {
      UI.hideBirdCard();
      showArchivePicker();
    });
  }

  function setupHelpButton() {
    document.getElementById('btn-help').addEventListener('click', UI.showHelp);
    const close = () => { UI.hideHelp(); localStorage.setItem('birdle_seen_help', '1'); };
    document.getElementById('btn-close-help').addEventListener('click', close);
    document.getElementById('overlay-help').addEventListener('click', e => {
      if (e.target === e.currentTarget) close();
    });
  }

  function setupStatsButton() {
    document.getElementById('btn-stats').addEventListener('click', () => UI.showStats(getStats()));
    document.getElementById('btn-close-stats').addEventListener('click', UI.hideStats);
    document.getElementById('overlay-stats').addEventListener('click', e => {
      if (e.target === e.currentTarget) UI.hideStats();
    });
  }

  function setupOverlayDismiss() {
    document.getElementById('overlay-card').addEventListener('click', e => {
      if (e.target === e.currentTarget) UI.hideBirdCard();
    });
  }

  function setupCreditsButton() {
    document.getElementById('btn-credits').addEventListener('click', UI.showCredits);
    document.getElementById('btn-close-credits').addEventListener('click', UI.hideCredits);
    document.getElementById('overlay-credits').addEventListener('click', e => {
      if (e.target === e.currentTarget) UI.hideCredits();
    });
  }

  // Delegated listener for the "back to archive" link in the context bar
  function setupContextDelegation() {
    document.getElementById('game-context').addEventListener('click', e => {
      if (e.target.id === 'btn-back-archive') showArchivePicker();
    });
  }

  // ── Theme (light / dark) ──────────────────────────────────────────────────
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    const btn = document.getElementById('btn-theme');
    if (btn) {
      btn.textContent = t === 'dark' ? '☀' : '🌙';
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function setupTheme() {
    // The <head> script already set the initial attribute; just sync the icon + wire the toggle.
    applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
    document.getElementById('btn-theme').addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('birdle_theme', next); } catch (_) {}
      applyTheme(next);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    setupTheme();
    setupModeTabs();
    setupGuessInput();
    setupCardButtons();
    setupHelpButton();
    setupStatsButton();
    setupOverlayDismiss();
    setupCreditsButton();
    setupContextDelegation();

    // ?bird=<id> forces a preview of that bird (QA aid); otherwise normal daily.
    const previewId = new URLSearchParams(location.search).get('bird');
    if (!(previewId && startPreviewGame(previewId))) {
      startDailyGame(loadProgress());
    }

    if (!localStorage.getItem('birdle_seen_help')) {
      setTimeout(() => UI.showHelp(), 800);
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return { submitGuess, startDailyGame, startArchiveGame, getStats, buildShareText };
})();
