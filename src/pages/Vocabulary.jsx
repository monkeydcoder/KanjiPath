import { useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { VOCAB_CATEGORIES, vocabCountForLevel } from "../data/vocab";
import { ACCENTS } from "../utils";

function WordCard({ word, emoji, practice }) {
  const [revealed, setRevealed] = useState(false);
  const hidden = practice && !revealed;
  const hasReading = word.r !== word.jp;

  return (
    <button
      type="button"
      onClick={() => practice && setRevealed((r) => !r)}
      className={`card flex items-start gap-3 p-4 text-left transition-all duration-200 ${
        practice ? "card-hover cursor-pointer active:scale-[0.98]" : "cursor-default"
      }`}
    >
      <span
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-stone-100 text-lg dark:bg-night-soft"
        aria-hidden
      >
        {emoji}
      </span>
      <span className="min-w-0">
        <span className="block font-jp text-lg font-bold leading-snug">{word.jp}</span>
        {hasReading && (
          <span className="block font-jp text-sm text-stone-500 dark:text-night-mute">{word.r}</span>
        )}
        <span
          className={`mt-0.5 block text-sm text-stone-600 transition-all duration-200 dark:text-stone-300 ${
            hidden ? "select-none blur-sm" : ""
          }`}
        >
          {hidden ? "tap to reveal" : word.en}
        </span>
      </span>
    </button>
  );
}

export default function Vocabulary() {
  const { level, levelData } = useStudy();
  const accent = ACCENTS[levelData.accent];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [practice, setPractice] = useState(false);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VOCAB_CATEGORIES
      .filter((c) => category === "all" || c.id === category)
      .map((c) => ({
        ...c,
        list: c.words[level].filter(
          (w) =>
            !q ||
            w.jp.includes(q) ||
            w.r.includes(q) ||
            w.en.toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.list.length > 0);
  }, [level, query, category]);

  const shownCount = sections.reduce((sum, c) => sum + c.list.length, 0);

  return (
    <div className="rise-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Vocabulary <span className={accent.text}>· {levelData.title}</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-night-mute">
            {vocabCountForLevel(level)} essential {level} words by topic. Use practice
            mode to hide the meanings and quiz yourself.
          </p>
        </div>
        <button
          onClick={() => setPractice((p) => !p)}
          className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-[0.96] ${
            practice ? `${accent.grad} text-white shadow-sm` : "btn-soft"
          }`}
          aria-pressed={practice}
        >
          🎯 Practice mode {practice ? "on" : "off"}
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a word in Japanese, kana or English…"
          className="input-base w-full sm:max-w-sm"
        />
        <div className="fade-x nice-scroll flex gap-2 overflow-x-auto px-1 pb-2 pt-1">
          <button
            onClick={() => setCategory("all")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-200 active:scale-95 ${
              category === "all"
                ? "bg-ink text-white shadow-sm dark:bg-stone-100 dark:text-night"
                : "bg-card text-stone-600 shadow-sm hover:-translate-y-0.5 dark:bg-night-card dark:text-stone-300"
            }`}
          >
            All topics
          </button>
          {VOCAB_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id === category ? "all" : c.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-200 active:scale-95 ${
                category === c.id
                  ? `${accent.grad} text-white shadow-sm`
                  : "bg-card text-stone-600 shadow-sm hover:-translate-y-0.5 dark:bg-night-card dark:text-stone-300"
              }`}
            >
              {c.emoji} {c.title}
            </button>
          ))}
        </div>
      </div>

      {shownCount === 0 ? (
        <p className="mt-10 text-center text-sm text-stone-500 dark:text-night-mute">
          No words match — try a different search or topic.
        </p>
      ) : (
        <div className="mt-4 space-y-10">
          {sections.map((c) => (
            <section key={c.id}>
              <h2 className="flex items-center gap-2.5">
                <span
                  className="grid h-8 w-8 place-items-center rounded-xl bg-stone-100 text-base dark:bg-night-soft"
                  aria-hidden
                >
                  {c.emoji}
                </span>
                <span className="section-label">
                  {c.title}
                  <span className="ml-1.5 font-normal normal-case tracking-normal [font-variant-numeric:tabular-nums]">
                    · {c.list.length} {c.list.length === 1 ? "word" : "words"}
                  </span>
                </span>
                <span className="h-px flex-1 bg-line dark:bg-night-line" aria-hidden />
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {c.list.map((word) => (
                  <WordCard
                    key={word.jp + word.en}
                    word={word}
                    emoji={c.emoji}
                    practice={practice}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
