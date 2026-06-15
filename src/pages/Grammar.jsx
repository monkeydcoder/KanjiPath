import { useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { grammarForLevel, GRAMMAR_TOPICS, TOPIC_BY_ID, PRIORITY_LABELS } from "../data/grammar";
import { ACCENTS } from "../utils";
import DetailDrawer from "../components/DetailDrawer";
import GrammarDetail from "../components/GrammarDetail";
import PriorityStars from "../components/PriorityStars";

const PRIORITY_ORDER = [3, 2, 1];

function LessonCard({ lesson, levelId, accent, onClick }) {
  const topic = TOPIC_BY_ID[lesson.topic];
  return (
    <button
      onClick={onClick}
      className="card card-hover group flex w-full flex-col p-4 text-left active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-jp text-2xl font-bold leading-tight">{lesson.jp}</span>
        <PriorityStars priority={lesson.priority} />
      </div>
      <h3 className="mt-2 font-display text-base font-bold leading-snug group-hover:text-shu-600 dark:group-hover:text-shu-400">
        {lesson.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-stone-500 dark:text-night-mute">{lesson.short}</p>
      <div className="mt-3 flex items-center gap-2 pt-1">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${accent.chip}`}>{levelId}</span>
        {topic && (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500 dark:bg-night-soft dark:text-night-mute">
            {topic.emoji} {topic.label}
          </span>
        )}
        <span className="ml-auto translate-x-0 text-stone-300 opacity-0 transition-all duration-200 group-hover:opacity-100 dark:text-night-mute">
          →
        </span>
      </div>
    </button>
  );
}

export default function Grammar() {
  const { level, levelData } = useStudy();
  const accent = ACCENTS[levelData.accent];
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [openId, setOpenId] = useState(null);

  const lessons = grammarForLevel(level);

  // Only show topic chips that actually have lessons at this level.
  const availableTopics = useMemo(() => {
    const present = new Set(lessons.map((l) => l.topic));
    return GRAMMAR_TOPICS.filter((t) => present.has(t.id));
  }, [lessons]);

  // Filter by search + topic, then group by priority (most important first).
  const { groups, ordered } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = lessons.filter((l) => {
      if (topic !== "all" && l.topic !== topic) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.jp.includes(query) ||
        l.short.toLowerCase().includes(q) ||
        l.structure.includes(query)
      );
    });
    const grouped = PRIORITY_ORDER.map((p) => ({
      priority: p,
      items: filtered.filter((l) => l.priority === p),
    })).filter((g) => g.items.length > 0);
    return { groups: grouped, ordered: grouped.flatMap((g) => g.items) };
  }, [lessons, query, topic, level]);

  const openIndex = openId ? ordered.findIndex((l) => l.id === openId) : -1;
  const open = openIndex >= 0 ? ordered[openIndex] : null;
  const goPrev = () => openIndex > 0 && setOpenId(ordered[openIndex - 1].id);
  const goNext = () => openIndex < ordered.length - 1 && setOpenId(ordered[openIndex + 1].id);

  return (
    <div className="rise-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Grammar <span className={accent.text}>· {levelData.title}</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-night-mute">
            {lessons.length} bite-size lessons, sorted most important first. Tap one for
            the pattern, examples and common traps.
          </p>
        </div>
        {/* Star legend */}
        <div className="rounded-2xl bg-stone-100/70 px-3 py-2 text-[11px] font-semibold text-stone-500 dark:bg-night-soft dark:text-night-mute">
          <span className="text-amber-500">★★★</span> {PRIORITY_LABELS[3]} ·{" "}
          <span className="text-amber-500">★★</span> {PRIORITY_LABELS[2]} ·{" "}
          <span className="text-amber-500">★</span> {PRIORITY_LABELS[1]}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search grammar, pattern or meaning…"
          className="input-base w-full sm:max-w-sm"
        />
        <div className="fade-x nice-scroll flex gap-2 overflow-x-auto px-1 pb-2 pt-1">
          <button
            onClick={() => setTopic("all")}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-200 active:scale-95 ${
              topic === "all"
                ? "bg-ink text-white shadow-sm dark:bg-stone-100 dark:text-night"
                : "bg-card text-stone-600 shadow-sm hover:-translate-y-0.5 dark:bg-night-card dark:text-stone-300"
            }`}
          >
            All topics
          </button>
          {availableTopics.map((t) => (
            <button
              key={t.id}
              onClick={() => setTopic(t.id === topic ? "all" : t.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-200 active:scale-95 ${
                topic === t.id
                  ? `${accent.grad} text-white shadow-sm`
                  : "bg-card text-stone-600 shadow-sm hover:-translate-y-0.5 dark:bg-night-card dark:text-stone-300"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {ordered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-stone-500 dark:text-night-mute">
          No lessons match — try a different search or topic.
        </p>
      ) : (
        <div className="mt-4 space-y-8">
          {groups.map((g) => (
            <section key={g.priority}>
              <h2 className="flex items-center gap-2.5">
                <PriorityStars priority={g.priority} size="text-base" />
                <span className="section-label">
                  {PRIORITY_LABELS[g.priority]}
                  <span className="ml-1.5 font-normal normal-case tracking-normal [font-variant-numeric:tabular-nums]">
                    · {g.items.length} {g.items.length === 1 ? "lesson" : "lessons"}
                  </span>
                </span>
                <span className="h-px flex-1 bg-line dark:bg-night-line" aria-hidden />
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    levelId={levelData.id}
                    accent={accent}
                    onClick={() => setOpenId(lesson.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {open && (
        <DetailDrawer
          title={`${open.jp} · ${levelData.title} Grammar`}
          onClose={() => setOpenId(null)}
          onPrev={goPrev}
          onNext={goNext}
          footer={
            <div className="flex items-center justify-between">
              <button onClick={goPrev} disabled={openIndex === 0} className="btn-soft">
                ← Prev
              </button>
              <span className="text-xs font-semibold text-stone-400 [font-variant-numeric:tabular-nums] dark:text-night-mute">
                {openIndex + 1} / {ordered.length}
              </span>
              <button
                onClick={goNext}
                disabled={openIndex === ordered.length - 1}
                className={`btn-grad px-5 py-2 ${accent.grad} ${accent.gradHover}`}
              >
                Next →
              </button>
            </div>
          }
        >
          <GrammarDetail lesson={open} accentKey={levelData.accent} />
        </DetailDrawer>
      )}
    </div>
  );
}
