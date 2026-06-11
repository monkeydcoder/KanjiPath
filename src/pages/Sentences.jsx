import { useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { ACCENTS } from "../utils";
import Furigana from "../components/Furigana";
import EmptyState from "../components/EmptyState";

function SentenceCard({ kanji, showFurigana, accent }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-1 font-jp text-sm font-bold ${accent.chip}`}>
          {kanji.char}
        </span>
        <span className="text-xs text-stone-400 capitalize">{kanji.meaning}</span>
      </div>
      <p className="mt-3 text-xl sm:text-2xl">
        <Furigana parts={kanji.sentence.parts} showFurigana={showFurigana} highlight={kanji.char} />
      </p>
      <button
        onClick={() => setRevealed((r) => !r)}
        className="mt-3 text-sm font-semibold text-stone-400 hover:text-stone-600"
      >
        {revealed ? "Hide translation" : "Show translation"}
      </button>
      {revealed && <p className="rise-in mt-1 text-sm text-stone-600">{kanji.sentence.en}</p>}
    </div>
  );
}

export default function Sentences() {
  const { levelData, learnedSet } = useStudy();
  const accent = ACCENTS[levelData.accent];
  const [showFurigana, setShowFurigana] = useState(true);
  const [learnedOnly, setLearnedOnly] = useState(false);

  const visible = useMemo(
    () =>
      learnedOnly
        ? levelData.kanji.filter((k) => learnedSet.has(k.char))
        : levelData.kanji,
    [levelData, learnedSet, learnedOnly]
  );

  return (
    <div className="rise-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Sentence practice · {levelData.title}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Read each kanji in a real sentence. Try reading without furigana first,
            then switch it on to check yourself.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFurigana((f) => !f)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              showFurigana ? `${accent.solid} text-white` : "bg-white text-stone-600 shadow-card"
            }`}
          >
            ふりがな {showFurigana ? "on" : "off"}
          </button>
          <button
            onClick={() => setLearnedOnly((l) => !l)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              learnedOnly ? "bg-stone-900 text-white" : "bg-white text-stone-600 shadow-card"
            }`}
          >
            Learned only
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="⛩️"
            title="No learned kanji yet"
            message="Mark some kanji as learned first, or switch off the “Learned only” filter to practice with every sentence."
            ctaTo="/learn"
            ctaLabel="Go to Learn"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {visible.map((kanji) => (
            <SentenceCard
              key={kanji.char}
              kanji={kanji}
              showFurigana={showFurigana}
              accent={accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
