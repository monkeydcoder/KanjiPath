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
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Revise · {levelData.title}</h1>
          <p className="mt-1 text-sm text-stone-500">
            Step through your learned kanji. Use ← → arrow keys too.
          </p>
        </div>
        <span className="text-sm font-semibold text-stone-400">
          {index + 1} / {learned.length}
        </span>
      </div>

      {/* Quick-jump strip */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-2">
        {learned.map((kanji, i) => (
          <button
            key={kanji.char}
            onClick={() => setIndex(i)}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 font-jp text-base transition-colors ${
              i === index ? `${accent.solid} text-white` : "bg-white text-stone-600 shadow-sm hover:bg-stone-100"
            }`}
          >
            {kanji.char}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-card">
        <KanjiDetail kanji={current} />
      </div>

      <div className="mt-5 flex justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-stone-700 shadow-card disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          onClick={() => setIndex((i) => Math.min(learned.length - 1, i + 1))}
          disabled={index === learned.length - 1}
          className={`rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-card disabled:opacity-40 ${accent.solid} ${accent.solidHover}`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
