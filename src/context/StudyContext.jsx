import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LEVELS } from "../data";
import { localDateKey } from "../utils";

const StudyContext = createContext(null);

const STORAGE_KEY = "kanjipath-progress";

// Bumped whenever the persisted shape changes, so a future migration can
// tell old data apart from current. For now there's only one shape, so
// any version (including a missing one, from before this field existed)
// is just re-validated by sanitizeProgress like everything else.
const PROGRESS_VERSION = 1;

// Leitner spaced repetition: box 1–5, review gaps in days per box.
// Correct → move up a box (longer gap). Wrong → back to box 1, due right away.
const SRS_INTERVALS_DAYS = [1, 2, 4, 8, 16];
const DAY_MS = 86400000;
const MAX_ACTIVITY_DAYS = 120;
const MAX_QUIZZES = 50;
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function promoted(entry) {
  const box = Math.min((entry?.box ?? 0) + 1, 5);
  return { box, due: Date.now() + SRS_INTERVALS_DAYS[box - 1] * DAY_MS };
}

const demoted = () => ({ box: 1, due: Date.now() });

/** Daily activity counter (for the streak), pruned to the last 120 days. */
function bumped(activity) {
  const key = localDateKey();
  const next = { ...activity, [key]: (activity[key] || 0) + 1 };
  const keys = Object.keys(next);
  if (keys.length > MAX_ACTIVITY_DAYS) {
    keys.sort();
    for (const k of keys.slice(0, keys.length - MAX_ACTIVITY_DAYS)) delete next[k];
  }
  return next;
}

function defaultProgress() {
  return { version: PROGRESS_VERSION, level: "N5", learned: [], quizzes: [], srs: {}, activity: {} };
}

/**
 * Validates and coerces a parsed progress object field-by-field and, within
 * each field, entry-by-entry — not just "is this an array/object". This is
 * the one function that decides what's trustworthy enough to become live
 * state, for BOTH sources of untrusted progress data: whatever's sitting in
 * localStorage (could be hand-edited, or written by a future/older version
 * of the app) and whatever a user drags in via "Import" (an arbitrary file
 * they picked off disk). A handful of malformed rows drop out silently
 * rather than the whole field (or the whole restore) being discarded.
 */
export function sanitizeProgress(parsed) {
  if (!parsed || typeof parsed !== "object") return defaultProgress();

  const learned = Array.isArray(parsed.learned)
    ? parsed.learned.filter((c) => typeof c === "string" && c.length > 0)
    : [];

  const quizzes = Array.isArray(parsed.quizzes)
    ? parsed.quizzes
        .filter(
          (q) =>
            q &&
            typeof q === "object" &&
            typeof q.level === "string" &&
            typeof q.kind === "string" &&
            Number.isFinite(q.correct) &&
            Number.isFinite(q.total) &&
            typeof q.date === "string" &&
            !Number.isNaN(Date.parse(q.date))
        )
        .slice(-MAX_QUIZZES)
    : [];

  const srs = {};
  if (parsed.srs && typeof parsed.srs === "object" && !Array.isArray(parsed.srs)) {
    for (const [id, entry] of Object.entries(parsed.srs)) {
      if (
        typeof id === "string" &&
        entry &&
        typeof entry === "object" &&
        Number.isInteger(entry.box) &&
        entry.box >= 1 &&
        entry.box <= 5 &&
        Number.isFinite(entry.due)
      ) {
        srs[id] = { box: entry.box, due: entry.due };
      }
    }
  }

  const activity = {};
  if (parsed.activity && typeof parsed.activity === "object" && !Array.isArray(parsed.activity)) {
    const keys = Object.keys(parsed.activity)
      .filter((k) => DATE_KEY_RE.test(k) && Number.isFinite(parsed.activity[k]) && parsed.activity[k] >= 0)
      .sort();
    for (const key of keys.slice(-MAX_ACTIVITY_DAYS)) {
      activity[key] = parsed.activity[key];
    }
  }

  return {
    version: PROGRESS_VERSION,
    level: parsed.level === "N4" ? "N4" : "N5",
    learned,
    quizzes,
    srs,
    activity,
  };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return sanitizeProgress(JSON.parse(raw));
  } catch {
    // Corrupt storage — start fresh.
  }
  return defaultProgress();
}

export function StudyProvider({ children }) {
  const [state, setState] = useState(loadProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    const learnedSet = new Set(state.learned);
    return {
      level: state.level,
      levelData: LEVELS[state.level],
      setLevel: (level) => setState((s) => ({ ...s, level })),

      learnedSet,
      isLearned: (char) => learnedSet.has(char),
      // Marking a kanji learned enrols it for spaced review; unmarking removes it.
      toggleLearned: (char) =>
        setState((s) => {
          const id = "k:" + char;
          if (s.learned.includes(char)) {
            const srs = { ...s.srs };
            delete srs[id];
            return { ...s, learned: s.learned.filter((c) => c !== char), srs };
          }
          return {
            ...s,
            learned: [...s.learned, char],
            srs: s.srs[id] ? s.srs : { ...s.srs, [id]: demoted() },
          };
        }),

      quizzes: state.quizzes,
      recordQuiz: (quiz) =>
        setState((s) => ({
          ...s,
          // Keep the most recent results.
          quizzes: [...s.quizzes, quiz].slice(-MAX_QUIZZES),
        })),

      // ---- Spaced repetition ----
      srs: state.srs,
      /** Flashcard answer: always enrols the item, then promotes/demotes it. */
      reviewItem: (id, correct) =>
        setState((s) => ({
          ...s,
          srs: { ...s.srs, [id]: correct ? promoted(s.srs[id]) : demoted() },
          activity: bumped(s.activity),
        })),
      /**
       * Test answer: a wrong answer enrols/demotes the item so it shows up in
       * the review deck; a right answer only promotes items already enrolled
       * (multiple choice is weaker evidence than flashcard recall).
       */
      noteTestAnswer: (id, correct) =>
        setState((s) => {
          let srs = s.srs;
          if (!correct) srs = { ...srs, [id]: demoted() };
          else if (srs[id]) srs = { ...srs, [id]: promoted(srs[id]) };
          return { ...s, srs, activity: bumped(s.activity) };
        }),
      bumpActivity: () => setState((s) => ({ ...s, activity: bumped(s.activity) })),

      activity: state.activity,

      resetProgress: () => setState(defaultProgress()),
    };
  }, [state]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}
