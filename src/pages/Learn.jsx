import { useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { ACCENTS } from "../utils";
import { romajiToHiragana, hiraganaToKatakana } from "../romaji";
import KanjiDetail from "../components/KanjiDetail";
import DetailDrawer from "../components/DetailDrawer";
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
  // The drawer freezes its own browsing order when opened. Tracking an index
  // into the live filtered list would make the open card jump or vanish when
  // marking a kanji learned under the "To learn" filter.
  const [drawer, setDrawer] = useState(null); // { chars: string[], index: number }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hira = q ? romajiToHiragana(q) : "";
    const kata = hira ? hiraganaToKatakana(hira) : "";
    return levelData.kanji.filter((k) => {
      if (filter === "learned" && !learnedSet.has(k.char)) return false;
      if (filter === "todo" && learnedSet.has(k.char)) return false;
      if (!q) return true;
      return (
        k.char.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.on.includes(query) ||
        k.kun.includes(query) ||
        (hira !== "" && (k.kun.includes(hira) || k.on.includes(kata)))
      );
    });
  }, [levelData, learnedSet, query, filter]);

  const learnedCount = levelData.kanji.filter((k) => learnedSet.has(k.char)).length;
  const open = drawer
    ? levelData.kanji.find((k) => k.char === drawer.chars[drawer.index])
    : null;
  const goPrev = () => setDrawer((d) => (d && d.index > 0 ? { ...d, index: d.index - 1 } : d));
  const goNext = () =>
    setDrawer((d) => (d && d.index < d.chars.length - 1 ? { ...d, index: d.index + 1 } : d));

  return (
    <div className="rise-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Learn <span className={accent.text}>· {levelData.title}</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-night-mute">
            Tap a kanji to see its readings, words and an example sentence.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <ProgressBar value={learnedCount} max={levelData.kanji.length} barClass={accent.bar} />
          <p className="mt-1.5 text-xs font-semibold text-stone-500 [font-variant-numeric:tabular-nums] dark:text-night-mute">
            {learnedCount} / {levelData.kanji.length} learned
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search kanji, meaning, kana or romaji…"
          className="input-base w-full sm:max-w-xs"
        />
        <div className="flex rounded-2xl bg-stone-200/60 p-1 text-sm font-semibold dark:bg-night-soft">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 rounded-xl px-4 py-1.5 transition-all duration-200 active:scale-95 sm:flex-none ${
                filter === f.id
                  ? "bg-card text-ink shadow-sm dark:bg-night dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-700 dark:text-night-mute dark:hover:text-stone-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold text-stone-400 [font-variant-numeric:tabular-nums] dark:text-night-mute sm:ml-auto">
          {visible.length} kanji shown
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-sm text-stone-500 dark:text-night-mute">
          No kanji match — try a different search or filter.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {visible.map((kanji, i) => {
            const learned = isLearned(kanji.char);
            return (
              <button
                key={kanji.char}
                onClick={() => setDrawer({ chars: visible.map((v) => v.char), index: i })}
                className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl border shadow-soft transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lift hover:ring-2 active:scale-95 ${accent.ring} ${
                  learned
                    ? `${accent.border} ${accent.soft}`
                    : "border-line bg-card dark:border-night-line dark:bg-night-card"
                }`}
              >
                {learned && (
                  <span
                    className={`absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold text-white ${accent.solid}`}
                  >
                    ✓
                  </span>
                )}
                <span className="font-kanji text-3xl font-bold sm:text-4xl">{kanji.char}</span>
                <span className="mt-1 w-full truncate px-1 text-center text-[10px] font-medium text-stone-500 dark:text-night-mute">
                  {kanji.meaning.split(";")[0]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {drawer && open && (
        <DetailDrawer
          title={`${open.char} · ${drawer.index + 1} / ${drawer.chars.length} · ${levelData.title}`}
          onClose={() => setDrawer(null)}
          onPrev={goPrev}
          onNext={goNext}
          footer={
            <div className="flex items-center justify-between">
              <button onClick={goPrev} disabled={drawer.index === 0} className="btn-soft">
                ← Prev
              </button>
              <span className="hidden text-xs font-semibold text-stone-400 dark:text-night-mute sm:inline">
                ← → keys work too
              </span>
              <button
                onClick={goNext}
                disabled={drawer.index === drawer.chars.length - 1}
                className={`btn-grad px-5 py-2 ${accent.grad} ${accent.gradHover}`}
              >
                Next →
              </button>
            </div>
          }
        >
          <KanjiDetail kanji={open} />
        </DetailDrawer>
      )}
    </div>
  );
}
