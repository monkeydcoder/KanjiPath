import { useStudy } from "../context/StudyContext";
import Furigana from "./Furigana";

function ReadingBlock({ label, value, className }) {
  return (
    <div className={`rounded-xl p-3 ${className}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </div>
      <div className="mt-0.5 font-jp text-base font-medium">
        {value || "—"}
      </div>
    </div>
  );
}

/** Full information card for one kanji. Used by Learn (modal) and Revise. */
export default function KanjiDetail({ kanji }) {
  const { isLearned, toggleLearned } = useStudy();
  const learned = isLearned(kanji.char);

  return (
    <div className="rise-in">
      <div className="flex items-start gap-5">
        <div className="grid h-28 w-28 shrink-0 place-items-center rounded-2xl bg-stone-900 font-jp text-7xl font-bold text-white shadow-card">
          {kanji.char}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold capitalize">{kanji.meaning}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {kanji.strokes} {kanji.strokes === 1 ? "stroke" : "strokes"}
          </p>
          <button
            onClick={() => toggleLearned(kanji.char)}
            className={`mt-3 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              learned
                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                : "bg-stone-900 text-white hover:bg-stone-700"
            }`}
          >
            {learned ? "✓ Learned — tap to unmark" : "Mark as learned"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ReadingBlock label="Onyomi · 音読み" value={kanji.on} className="bg-rose-50 text-rose-900" />
        <ReadingBlock label="Kunyomi · 訓読み" value={kanji.kun} className="bg-sky-50 text-sky-900" />
      </div>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          Example words
        </h3>
        <ul className="mt-2 space-y-2">
          {kanji.words.map((word) => (
            <li
              key={word.w}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-xl bg-stone-50 px-4 py-2.5"
            >
              <span className="font-jp text-lg font-semibold">{word.w}</span>
              <span className="font-jp text-sm text-stone-500">{word.r}</span>
              <span className="text-sm text-stone-600">{word.m}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          Example sentence
        </h3>
        <div className="mt-2 rounded-xl bg-amber-50/80 px-4 py-3">
          <p className="text-lg">
            <Furigana parts={kanji.sentence.parts} highlight={kanji.char} />
          </p>
          <p className="mt-1.5 text-sm text-stone-600">{kanji.sentence.en}</p>
        </div>
      </div>
    </div>
  );
}
