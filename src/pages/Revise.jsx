import { useEffect, useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { ACCENTS } from "../utils";
import KanjiDetail from "../components/KanjiDetail";
import EmptyState from "../components/EmptyState";

export default function Revise() {
  const { levelData, learnedSet } = useStudy();
  const accent = ACCENTS[levelData.accent];
  const [index, setIndex] = useState(0);

  const learned = useMemo(
    () => levelData.kanji.filter((k) => learnedSet.has(k.char)),
    [levelData, learnedSet]
  );

  // Keep index valid when the level changes or kanji are unmarked.
  useEffect(() => {
    if (index > learned.length - 1) setIndex(Math.max(0, learned.length - 1));
  }, [learned.length, index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(learned.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [learned.length]);

  if (learned.length === 0) {
    return (
      <EmptyState
        icon="🌱"
        title={`Nothing to revise in ${levelData.title} yet`}
        message="Mark kanji as learned in the Learn section, and they will show up here for structured review."
        ctaTo="/learn"
        ctaLabel="Go to Learn"
      />
    );
  }

  const current = learned[Math.min(index, learned.length - 1)];

  return (
    <div className="rise-in mx-auto max-w-xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Revise <span className={accent.text}>· {levelData.title}</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-night-mute">
            Step through your learned kanji. Use ← → arrow keys too.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-stone-200/60 px-3 py-1 text-xs font-bold text-stone-500 [font-variant-numeric:tabular-nums] dark:bg-night-soft dark:text-night-mute">
          {index + 1} / {learned.length}
        </span>
      </div>

      {/* Quick-jump strip */}
      <div className="fade-x nice-scroll mt-4 flex gap-1.5 overflow-x-auto px-1 pb-2 pt-1">
        {learned.map((kanji, i) => (
          <button
            key={kanji.char}
            onClick={() => setIndex(i)}
            className={`shrink-0 rounded-xl px-2.5 py-1.5 font-kanji text-base transition-all duration-200 active:scale-90 ${
              i === index
                ? `${accent.grad} text-white shadow-sm`
                : "bg-card text-stone-600 shadow-sm hover:-translate-y-0.5 hover:shadow-soft dark:bg-night-card dark:text-stone-300"
            }`}
          >
            {kanji.char}
          </button>
        ))}
      </div>

      <div className="card mt-4 p-6">
        <KanjiDetail kanji={current} />
      </div>

      <div className="mt-5 flex justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="btn-soft px-6 py-2.5"
        >
          ← Previous
        </button>
        <button
          onClick={() => setIndex((i) => Math.min(learned.length - 1, i + 1))}
          disabled={index === learned.length - 1}
          className={`btn-grad px-6 py-2.5 ${accent.grad} ${accent.gradHover}`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
