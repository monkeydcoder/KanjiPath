# 漢 KanjiPath

A clean, beginner-friendly web app for learning **JLPT N5 and N4 kanji** — all 80 N5
kanji and all 167 N4 kanji, each with onyomi/kunyomi readings, English meanings,
example words, and a simple example sentence with furigana.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

To create a production build: `npm run build` (output in `dist/`, previewable with
`npm run preview`).

## Features

- **Dashboard** — progress per level, test accuracy, recent test results.
- **Learn** — browse all kanji of a level, search by character/meaning/reading,
  filter by learned status, and open a full detail card. Mark kanji as learned.
- **Revise** — step through your learned kanji one at a time (arrow keys work).
- **Test** — mixed multiple-choice quiz (meaning, reading, and kanji recognition)
  with instant feedback and a short explanation after every question.
- **Flashcards** — flip cards with an "Again / Got it" loop; missed cards return
  to the back of the deck until you know them.
- **Sentence practice** — read every kanji in a real sentence with toggleable
  furigana and tap-to-reveal translations.
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
  context/
    StudyContext.jsx global state: current level, learned set, quiz history
                     (persisted to localStorage)
  components/        reusable UI (Layout, KanjiDetail, Furigana, Modal, …)
  pages/             one file per route (Dashboard, Learn, Revise, Test,
                     Flashcards, Sentences)
  utils.js           accent color maps, shuffle/sample helpers
```

## Adding more kanji or levels

1. Create a data file exporting an array of `K(...)` entries
   (see `src/data/kanjiFactory.js` for the field documentation).
2. Register the level in `src/data/index.js` with a title and accent color.
3. Done — every page (Learn, Test, Flashcards, …) picks it up automatically.

## Tech stack

React 18 · Vite 5 · Tailwind CSS 3 · React Router 6. No backend — progress lives
in your browser's localStorage.
