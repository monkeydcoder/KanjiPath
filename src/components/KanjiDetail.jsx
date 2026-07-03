import { useStudy } from "../context/StudyContext";
import { onyomiRomaji } from "../romaji";
import Furigana from "./Furigana";
import SpeakButton from "./SpeakButton";

function ReadingBlock({ label, jp, value, romaji, className }) {
  return (
    <div className={`rounded-2xl border p-3.5 ${className}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">{label}</span>
        <span className="font-jp text-[11px] opacity-60">{jp}</span>
      </div>
      <div className="mt-1 font-jp text-lg font-semibold">
        {value || "—"}
        {romaji && (
          <span className="ml-2 align-middle font-sans text-xs font-semibold opacity-60">
            ({romaji})
          </span>
        )}
      </div>
    </div>
  );
}

/** Full information card for one kanji. Used by Learn (drawer) and Revise. */
export default function KanjiDetail({ kanji }) {
  const { isLearned, toggleLearned } = useStudy();
  const learned = isLearned(kanji.char);

  return (
    <div className="rise-in">
      <div className="flex items-start gap-5">
        <div className="relative grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-stone-800 to-stone-950 font-kanji text-8xl font-bold text-paper shadow-lift dark:from-stone-100 dark:to-stone-300 dark:text-night">
          {kanji.char}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-3xl font-bold capitalize leading-tight">
            {kanji.meaning}
          </h2>
          <p className="mt-1 text-sm font-medium text-stone-500 dark:text-night-mute">
            {kanji.strokes} {kanji.strokes === 1 ? "stroke" : "strokes"}
          </p>
          <button
            onClick={() => toggleLearned(kanji.char)}
            className={`mt-3 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-95 ${
              learned
                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:hover:bg-emerald-900"
                : "bg-ink text-white shadow-soft hover:bg-stone-700 dark:bg-stone-100 dark:text-night dark:hover:bg-white"
            }`}
          >
            {learned ? "✓ Learned — tap to unmark" : "Mark as learned"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <ReadingBlock
          label="Onyomi"
          jp="音読み"
          value={kanji.on}
          romaji={kanji.on ? onyomiRomaji(kanji.on) : ""}
          className="border-rose-200/70 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
        />
        <ReadingBlock
          label="Kunyomi"
          jp="訓読み"
          value={kanji.kun}
          className="border-sky-200/70 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200"
        />
      </div>

      <div className="mt-6">
        <h3 className="section-label">Example words</h3>
        <ul className="mt-2.5 space-y-2">
          {kanji.words.map((word) => (
            <li
              key={word.w}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-2xl border-l-4 border-emerald-400/70 bg-stone-100/70 px-4 py-3 dark:border-emerald-500/50 dark:bg-night-soft"
            >
              <span className="font-jp text-xl font-bold">{word.w}</span>
              <span className="font-jp text-sm text-stone-500 dark:text-night-mute">{word.r}</span>
              <span className="text-sm text-stone-600 dark:text-stone-300">{word.m}</span>
              <SpeakButton text={word.r} className="ml-auto self-center" />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="section-label">Example sentence</h3>
        <div className="mt-2.5 rounded-2xl border border-amber-200/70 bg-amber-50/80 px-5 py-4 dark:border-amber-900/40 dark:bg-amber-950/25">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xl leading-loose sm:text-2xl">
              <Furigana parts={kanji.sentence.parts} highlight={kanji.char} />
            </p>
            <SpeakButton
              text={kanji.sentence.parts.map(([t, r]) => r || t).join("")}
              className="mt-1"
            />
          </div>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{kanji.sentence.en}</p>
        </div>
      </div>
    </div>
  );
}
