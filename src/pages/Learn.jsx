import { useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { ACCENTS } from "../utils";
import KanjiDetail from "../components/KanjiDetail";
import Modal from "../components/Modal";
import ProgressBar from "../components/ProgressBar";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "todo", label: "To learn" },
  { id: "learned", label: "Learned" },
];

export default function Learn() {
  const { levelData, learnedSet, isLearned } = useStudy();
  const accent = ACCENTS[levelData.accent];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return levelData.kanji.filter((k) => {
      if (filter === "learned" && !learnedSet.has(k.char)) return false;
      if (filter === "todo" && learnedSet.has(k.char)) return false;
      if (!q) return true;
      return (
        k.char.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.on.includes(query) ||
        k.kun.includes(query)
      );
    });
  }, [levelData, learnedSet, query, filter]);

  const learnedCount = levelData.kanji.filter((k) => learnedSet.has(k.char)).length;
  const open = openIndex !== null ? visible[openIndex] : null;

  return (
    <div className="rise-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Learn · {levelData.title}</h1>
          <p className="mt-1 text-sm text-stone-500">
            Tap a kanji to see its readings, words and an example sentence.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <ProgressBar value={learnedCount} max={levelData.kanji.length} barClass={accent.bar} />
          <p className="mt-1.5 text-xs font-medium text-stone-500">
            {learnedCount} / {levelData.kanji.length} learned
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search kanji, meaning or reading…"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none focus:border-stone-400 sm:max-w-xs"
        />
        <div className="flex rounded-xl bg-stone-100 p-1 text-sm font-medium">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 rounded-lg px-4 py-1.5 transition-colors sm:flex-none ${
                filter === f.id ? "bg-white text-ink shadow-sm" : "text-stone-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-sm text-stone-500">
          No kanji match — try a different search or filter.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {visible.map((kanji, i) => {
            const learned = isLearned(kanji.char);
            return (
              <button
                key={kanji.char}
                onClick={() => setOpenIndex(i)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border bg-white shadow-card transition-all hover:-translate-y-0.5 ${
                  learned ? `${accent.border} ${accent.soft}` : "border-stone-200"
                }`}
              >
                {learned && (
                  <span className={`absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold text-white ${accent.solid}`}>
                    ✓
                  </span>
                )}
                <span className="font-jp text-3xl font-bold sm:text-4xl">{kanji.char}</span>
                <span className="mt-1 w-full truncate px-1 text-center text-[10px] font-medium text-stone-500">
                  {kanji.meaning.split(";")[0]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {open && (
        <Modal onClose={() => setOpenIndex(null)}>
          <KanjiDetail kanji={open} />
          <div className="mt-6 flex justify-between border-t border-stone-100 pt-4">
            <button
              onClick={() => setOpenIndex((i) => Math.max(0, i - 1))}
              disabled={openIndex === 0}
              className="rounded-full bg-stone-100 px-5 py-2 text-sm font-semibold text-stone-700 disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="self-center text-xs font-medium text-stone-400">
              {openIndex + 1} / {visible.length}
            </span>
            <button
              onClick={() => setOpenIndex((i) => Math.min(visible.length - 1, i + 1))}
              disabled={openIndex === visible.length - 1}
              className="rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
