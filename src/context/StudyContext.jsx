import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LEVELS } from "../data";
import { localDateKey } from "../utils";

const StudyContext = createContext(null);

const STORAGE_KEY = "kanjipath-progress";

// Leitner spaced repetition: box 1–5, review gaps in days per box.
// Correct → move up a box (longer gap). Wrong → back to box 1, due right away.
const SRS_INTERVALS_DAYS = [1, 2, 4, 8, 16];
const DAY_MS = 86400000;

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
  if (keys.length > 120) {
    keys.sort();
    for (const k of keys.slice(0, keys.length - 120)) delete next[k];
  }
  return next;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        level: parsed.level === "N4" ? "N4" : "N5",
        learned: Array.isArray(parsed.learned) ? parsed.learned : [],
        quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
        srs: parsed.srs && typeof parsed.srs === "object" ? parsed.srs : {},
        activity: parsed.activity && typeof parsed.activity === "object" ? parsed.activity : {},
      };
    }
  } catch {
    // Corrupt storage — start fresh.
  }
  return { level: "N5", learned: [], quizzes: [], srs: {}, activity: {} };
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
          // Keep the most recent 50 results.
          quizzes: [...s.quizzes, quiz].slice(-50),
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

      resetProgress: () =>
        setState({ level: "N5", learned: [], quizzes: [], srs: {}, activity: {} }),
    };
  }, [state]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}
