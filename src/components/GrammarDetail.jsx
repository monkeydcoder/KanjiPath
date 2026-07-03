import { TOPIC_BY_ID } from "../data/grammar";
import { ACCENTS } from "../utils";
import PriorityStars from "./PriorityStars";
import SpeakButton from "./SpeakButton";

function Example({ ex }) {
  return (
    <li className="rounded-2xl border-l-4 border-emerald-400/70 bg-stone-100/70 px-4 py-3 dark:border-emerald-500/50 dark:bg-night-soft">
      <div className="flex items-start justify-between gap-2">
        <p className="font-jp text-lg font-bold leading-relaxed">{ex.jp}</p>
        <SpeakButton text={ex.jp} />
      </div>
      <p className="mt-0.5 text-sm italic text-stone-500 dark:text-night-mute">{ex.romaji}</p>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{ex.en}</p>
    </li>
  );
}

/** Full lesson body for one grammar point. Rendered inside DetailDrawer. */
export default function GrammarDetail({ lesson, accentKey }) {
  const accent = ACCENTS[accentKey];
  const topic = TOPIC_BY_ID[lesson.topic];

  return (
    <div className="rise-in">
      <div className="flex flex-wrap items-center gap-2">
        <PriorityStars priority={lesson.priority} size="text-base" showLabel />
        {topic && (
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600 dark:bg-night-soft dark:text-stone-300">
            {topic.emoji} {topic.label}
          </span>
        )}
      </div>

      <p className="mt-4 font-jp text-4xl font-bold leading-tight">{lesson.jp}</p>
      <h2 className="mt-1 font-display text-xl font-bold">{lesson.title}</h2>
      <p className="mt-2 text-stone-600 dark:text-stone-300">{lesson.short}</p>

      <div className="mt-5">
        <h3 className="section-label">When to use it</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          {lesson.use}
        </p>
      </div>

      <div className="mt-5">
        <h3 className="section-label">Pattern</h3>
        <p className={`mt-1.5 rounded-2xl border px-4 py-3 font-jp text-base font-semibold ${accent.border} ${accent.soft} ${accent.softText}`}>
          {lesson.structure}
        </p>
      </div>

      <div className="mt-5">
        <h3 className="section-label">Examples</h3>
        <ul className="mt-2 space-y-2.5">
          {lesson.examples.map((ex, i) => (
            <Example key={i} ex={ex} />
          ))}
        </ul>
      </div>

      {lesson.note && (
        <div className="mt-5 rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/25">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
            <span aria-hidden>⚠️</span> Watch out
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-700 dark:text-stone-200">
            {lesson.note}
          </p>
        </div>
      )}
    </div>
  );
}
