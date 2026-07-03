# 漢 KanjiPath

A clean, beginner-friendly web app for learning **JLPT N5 and N4 Japanese** — 247 kanji,
500+ vocabulary words, and ~100 grammar patterns, all with readings, meanings,
example sentences, spaced repetition, quizzes, and audio pronunciation.

<p align="center">
  <img src="preview.gif?v=2" alt="KanjiPath walkthrough – Dashboard, Learn, Kanji detail, Vocabulary, Grammar, Test, Flashcards, Sentences" width="720" />
</p>

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5176 (or whichever port Vite assigns).

To create a production build: `npm run build` (output in `dist/`, previewable with
`npm run preview`).

## Features

- **Dashboard** — progress per level, test accuracy, recent test results.
- **Learn** — browse all kanji of a level, search by character/meaning/reading,
  filter by learned status, and open a full detail card. Mark kanji as learned.
- **Revise** — step through your learned kanji one at a time (arrow keys work).
- **Test** — kanji, vocabulary, and grammar quizzes with JLPT-style same-type
  options, sentence-cloze questions, shuffled question types, instant
  explanations, and a "retry missed" loop. Wrong answers feed the review deck.
- **Flashcards + spaced repetition** — kanji and vocabulary decks in both
  directions (JP→EN, EN→JP). "Got it / Again" moves cards up and down a
  5-box Leitner ladder (1→16-day intervals); the "Due review" deck and the
  dashboard's due counter tell you exactly what to study today.
- **Audio** — 🔊 buttons speak words, readings, and sentences with the
  browser's built-in Japanese voice.
- **Streak & backup** — daily study streak on the dashboard, plus
  export/import/reset of all progress.
- **Sentence practice** — read every kanji in a real sentence with toggleable
  furigana and tap-to-reveal translations.
- **Vocabulary** — essential N5 & N4 words grouped by topic, with a practice mode
  that hides meanings.
- **Grammar** — ~100 bite-size N5/N4 grammar lessons sorted by ★ priority, with
  topic filters and a slide-in detail panel (pattern, examples, common traps).
- **N5 / N4 switch** — global level toggle in the header; progress is tracked
  separately per kanji and saved to `localStorage` automatically.

## Project structure

```
src/
  data/            kanji datasets (one file per level / chunk)
    kanjiFactory.js  compact entry constructor + data shape docs
    n5.js            all 80 N5 kanji in a structured learning order
    n4-part1..3.js   all 167 N4 kanji, ordered by usefulness
    index.js         LEVELS registry — add future levels (N3…) here
    vocab.js         N5 & N4 vocabulary grouped by topic
    grammarFactory.js  G() constructor + GRAMMAR_TOPICS registry
    grammar-n5.js / grammar-n4.js  grammar lessons per level
    grammar.js       combines levels + helpers (grammarForLevel, …)
  context/
    StudyContext.jsx global state: current level, learned set, quiz history
                     (persisted to localStorage)
    ThemeContext.jsx light/dark theme, persisted to localStorage
  components/        reusable UI (Layout, KanjiDetail, GrammarDetail,
                     DetailDrawer, PriorityStars, Furigana, …)
  pages/             one file per route (Dashboard, Learn, Vocabulary,
                     Grammar, Revise, Test, Flashcards, Sentences)
  utils.js           accent color maps, shuffle/sample helpers
```

## Adding more kanji or levels

1. Create a data file exporting an array of `K(...)` entries
   (see `src/data/kanjiFactory.js` for the field documentation).
2. Register the level in `src/data/index.js` with a title and accent color.
3. Done — every page (Learn, Test, Flashcards, …) picks it up automatically.

## Adding grammar lessons

1. Add a `G(...)` entry to `src/data/grammar-n5.js` or `grammar-n4.js`
   (see `grammarFactory.js` for the field order and `GRAMMAR_TOPICS` for valid
   topic ids).
2. Set its `priority` (3 = ★★★ essential, 2 = ★★, 1 = ★) — the Grammar page
   sorts and groups by it automatically.

## Tech stack

React 18 · Vite 5 · Tailwind CSS 3 · React Router 6. No backend — progress lives
in your browser's localStorage.
