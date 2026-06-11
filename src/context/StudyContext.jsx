import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LEVELS } from "../data";

const StudyContext = createContext(null);

const STORAGE_KEY = "kanjipath-progress";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        level: parsed.level === "N4" ? "N4" : "N5",
        learned: Array.isArray(parsed.learned) ? parsed.learned : [],
        quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
      };
    }
  } catch {
    // Corrupt storage — start fresh.
  }
  return { level: "N5", learned: [], quizzes: [] };
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
      toggleLearned: (char) =>
        setState((s) => ({
          ...s,
          learned: s.learned.includes(char)
            ? s.learned.filter((c) => c !== char)
            : [...s.learned, char],
        })),

      quizzes: state.quizzes,
      recordQuiz: (quiz) =>
        setState((s) => ({
          ...s,
          // Keep the most recent 50 results.
          quizzes: [...s.quizzes, quiz].slice(-50),
        })),

      resetProgress: () => setState({ level: "N5", learned: [], quizzes: [] }),
    };
  }, [state]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}
