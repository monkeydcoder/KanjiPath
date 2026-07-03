import { useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { ACCENTS } from "../utils";
import Furigana from "../components/Furigana";
import EmptyState from "../components/EmptyState";
import SpeakButton from "../components/SpeakButton";

function SentenceCard({ kanji, showFurigana, accent }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="card card-hover flex flex-col p-5">
      <p className="text-xl leading-loose sm:text-2xl">
        <Furigana parts={kanji.sentence.parts} showFurigana={showFurigana} highlight={kanji.char} />
      </p>

      {revealed && (
        <p className="rise-in mt-2 text-sm text-stone-600 dark:text-stone-300">
          {kanji.sentence.en}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3 dark:border-night-line/70">
        <span className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 font-kanji text-sm font-bold ${accent.chip}`}>
            {kanji.char}
          </span>
          <span className="text-xs font-medium capitalize text-stone-400 dark:text-night-mute">
            {kanji.meaning}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <SpeakButton text={kanji.sentence.parts.map(([t, r]) => r || t).join("")} />
          <button
            onClick={() => setRevealed((r) => !r)}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold text-stone-400 transition-colors duration-200 hover:text-stone-600 dark:text-night-mute dark:hover:text-stone-300"
          >
            {revealed ? "Hide" : "Translate"}
            <span
              aria-hidden
              className={`inline-block transition-transform duration-200 ${revealed ? "rotate-180" : ""}`}
            >
              ⌄
            </span>
          </button>
        </span>
      </div>
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
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Sentences <span className={accent.text}>· {levelData.title}</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-night-mute">
            Read each kanji in a real sentence. Try reading without furigana first,
            then switch it on to check yourself.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFurigana((f) => !f)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-[0.96] ${
              showFurigana ? `${accent.grad} text-white shadow-sm` : "btn-soft"
            }`}
            aria-pressed={showFurigana}
          >
            ふりがな {showFurigana ? "on" : "off"}
          </button>
          <button
            onClick={() => setLearnedOnly((l) => !l)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-[0.96] ${
              learnedOnly
                ? "bg-ink text-white shadow-sm dark:bg-stone-100 dark:text-night"
                : "btn-soft"
            }`}
            aria-pressed={learnedOnly}
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
