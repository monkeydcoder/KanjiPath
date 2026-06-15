import { Link } from "react-router-dom";
import { useStudy } from "../context/StudyContext";
import { LEVELS, LEVEL_IDS } from "../data";
import { ACCENTS, formatDate } from "../utils";
import ProgressBar from "../components/ProgressBar";

const MODES = [
  { to: "/learn", emoji: "📖", title: "Learn", desc: "Browse kanji with readings, words and sentences", tint: "bg-emerald-50 dark:bg-emerald-950/40" },
  { to: "/vocabulary", emoji: "🗂️", title: "Vocabulary", desc: "Essential N5 & N4 words, organized by topic", tint: "bg-amber-50 dark:bg-amber-950/30" },
  { to: "/grammar", emoji: "📐", title: "Grammar", desc: "Bite-size N5 & N4 grammar, by priority", tint: "bg-teal-50 dark:bg-teal-950/40" },
  { to: "/revise", emoji: "🔁", title: "Revise", desc: "Step back through everything you've learned", tint: "bg-sky-50 dark:bg-sky-950/40" },
  { to: "/flashcards", emoji: "🃏", title: "Flashcards", desc: "Flip cards to lock readings into memory", tint: "bg-violet-50 dark:bg-violet-950/40" },
  { to: "/test", emoji: "✅", title: "Test", desc: "Quiz yourself on meanings and readings", tint: "bg-rose-50 dark:bg-rose-950/30" },
  { to: "/sentences", emoji: "⛩️", title: "Sentences", desc: "Read your kanji in real context, with furigana", tint: "bg-indigo-50 dark:bg-indigo-950/40" },
];

function Stat({ value, label, emoji, tint }) {
  return (
    <div className="card flex items-center gap-3.5 px-4 py-4">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl ${tint}`}>
        {emoji}
      </span>
      <div>
        <div className="font-display text-2xl font-bold leading-none [font-variant-numeric:tabular-nums]">
          {value}
        </div>
        <div className="mt-1 text-xs font-medium text-stone-500 dark:text-night-mute">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { level, setLevel, learnedSet, quizzes } = useStudy();

  const totalAnswered = quizzes.reduce((sum, q) => sum + q.total, 0);
  const totalCorrect = quizzes.reduce((sum, q) => sum + q.correct, 0);
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : null;
  const recent = [...quizzes].slice(-5).reverse();
  const activeAccent = ACCENTS[LEVELS[level].accent];

  return (
    <div className="rise-in space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-emerald-100/80 via-card to-amber-100/60 px-6 py-8 shadow-soft dark:border-night-line dark:from-emerald-950/40 dark:via-night-card dark:to-indigo-950/40 sm:px-10 sm:py-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-10 select-none font-kanji text-[11rem] font-black leading-none text-ink/[0.06] dark:text-white/[0.05] sm:text-[13rem]"
        >
          漢字
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-jp text-sm font-bold text-shu-600 dark:text-shu-400">こんにちは！</p>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${activeAccent.chip}`}>
            studying {LEVELS[level].title}
          </span>
        </div>
        <h1 className="mt-2 max-w-md font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Your kanji journey, one step a day
        </h1>
        <p className="mt-2 max-w-lg text-sm text-stone-600 dark:text-stone-300 sm:text-base">
          Start with the N5 basics, then climb to N4. Learn a few kanji, revise them,
          then test yourself.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/learn"
            className={`btn-grad px-6 py-2.5 ${activeAccent.grad} ${activeAccent.gradHover}`}
          >
            Continue learning →
          </Link>
          <Link to="/test" className="btn-soft px-6 py-2.5">
            Take a test
          </Link>
        </div>
      </section>

      {/* Level progress */}
      <section className="grid gap-4 sm:grid-cols-2">
        {LEVEL_IDS.map((id) => {
          const data = LEVELS[id];
          const accent = ACCENTS[data.accent];
          const learnedCount = data.kanji.filter((k) => learnedSet.has(k.char)).length;
          const pct = Math.round((learnedCount / data.kanji.length) * 100);
          const active = level === id;
          return (
            <button
              key={id}
              onClick={() => setLevel(id)}
              className={`card card-hover relative overflow-hidden p-5 text-left active:scale-[0.99] ${
                active ? `ring-2 ${accent.ring}` : ""
              }`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-5 right-1 select-none font-display text-8xl font-extrabold leading-none text-ink/[0.05] dark:text-white/[0.05]"
              >
                {id}
              </span>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">{data.title}</h2>
                {active && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${accent.chip}`}>
                    studying now
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-stone-500 dark:text-night-mute">{data.subtitle}</p>
              <div className="mt-4">
                <ProgressBar value={learnedCount} max={data.kanji.length} barClass={accent.bar} />
                <div className="mt-2 flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-stone-600 [font-variant-numeric:tabular-nums] dark:text-stone-300">
                    {learnedCount} / {data.kanji.length} kanji
                  </p>
                  <span className={`text-sm font-bold ${accent.text}`}>{pct}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat value={learnedSet.size} label="kanji learned" emoji="🈷️" tint="bg-emerald-50 dark:bg-emerald-950/40" />
        <Stat value={quizzes.length} label="tests taken" emoji="📝" tint="bg-sky-50 dark:bg-sky-950/40" />
        <Stat value={accuracy === null ? "—" : `${accuracy}%`} label="test accuracy" emoji="🎯" tint="bg-amber-50 dark:bg-amber-950/30" />
      </section>

      {/* Study modes */}
      <section>
        <h2 className="section-label">Study modes</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((mode) => (
            <Link key={mode.to} to={mode.to} className="card card-hover group p-5 active:scale-[0.99]">
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl text-xl transition-transform duration-200 group-hover:scale-110 ${mode.tint}`}>
                  {mode.emoji}
                </span>
                <span className="font-display text-base font-bold transition-colors group-hover:text-shu-600 dark:group-hover:text-shu-400">
                  {mode.title}
                </span>
                <span className="ml-auto -translate-x-1 text-stone-400 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 dark:text-night-mute">
                  →
                </span>
              </div>
              <p className="mt-2.5 text-sm text-stone-500 dark:text-night-mute">{mode.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent tests */}
      {recent.length > 0 && (
        <section>
          <h2 className="section-label">Recent tests</h2>
          <ul className="card mt-3 divide-y divide-line overflow-hidden dark:divide-night-line">
            {recent.map((quiz, i) => {
              const pct = Math.round((quiz.correct / quiz.total) * 100);
              const tone =
                pct >= 80
                  ? "text-emerald-600 dark:text-emerald-400"
                  : pct >= 50
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400";
              const dot = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500";
              return (
                <li key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="flex items-center gap-2.5 font-semibold">
                    <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
                    {quiz.level} {quiz.kind === "vocab" ? "Vocab" : "Kanji"} ·{" "}
                    {formatDate(quiz.date)}
                  </span>
                  <span className={`font-bold [font-variant-numeric:tabular-nums] ${tone}`}>
                    {quiz.correct}/{quiz.total} ({pct}%)
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
