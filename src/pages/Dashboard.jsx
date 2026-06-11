import { Link } from "react-router-dom";
import { useStudy } from "../context/StudyContext";
import { LEVELS, LEVEL_IDS } from "../data";
import { ACCENTS, formatDate } from "../utils";
import ProgressBar from "../components/ProgressBar";

const MODES = [
  { to: "/learn", emoji: "📖", title: "Learn", desc: "Browse kanji with readings, words and sentences" },
  { to: "/revise", emoji: "🔁", title: "Revise", desc: "Step back through everything you've learned" },
  { to: "/flashcards", emoji: "🃏", title: "Flashcards", desc: "Flip cards to lock readings into memory" },
  { to: "/test", emoji: "✅", title: "Test", desc: "Quiz yourself on meanings and readings" },
  { to: "/sentences", emoji: "⛩️", title: "Sentence practice", desc: "Read your kanji in real context, with furigana" },
];

export default function Dashboard() {
  const { level, setLevel, learnedSet, quizzes } = useStudy();

  const totalAnswered = quizzes.reduce((sum, q) => sum + q.total, 0);
  const totalCorrect = quizzes.reduce((sum, q) => sum + q.correct, 0);
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : null;
  const recent = [...quizzes].slice(-5).reverse();

  return (
    <div className="rise-in space-y-8">
      <section>
        <p className="font-jp text-sm font-medium text-stone-400">こんにちは！</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          Welcome back to your kanji journey
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          Start with the N5 basics, then move up to N4. Learn a few kanji, revise
          them, then test yourself — small steps every day.
        </p>
      </section>

      {/* Level progress */}
      <section className="grid gap-4 sm:grid-cols-2">
        {LEVEL_IDS.map((id) => {
          const data = LEVELS[id];
          const accent = ACCENTS[data.accent];
          const learnedCount = data.kanji.filter((k) => learnedSet.has(k.char)).length;
          const active = level === id;
          return (
            <button
              key={id}
              onClick={() => setLevel(id)}
              className={`rounded-3xl border bg-white p-5 text-left shadow-card transition-all ${
                active ? `${accent.border} ring-2 ${accent.ring}` : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{data.title}</h2>
                {active && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${accent.chip}`}>
                    studying now
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-stone-500">{data.subtitle}</p>
              <div className="mt-4">
                <ProgressBar value={learnedCount} max={data.kanji.length} barClass={accent.bar} />
                <p className="mt-2 text-sm font-medium text-stone-600">
                  {learnedCount} / {data.kanji.length} kanji learned
                </p>
              </div>
            </button>
          );
        })}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 text-center shadow-card">
          <div className="text-2xl font-extrabold">{learnedSet.size}</div>
          <div className="mt-0.5 text-xs font-medium text-stone-500">kanji learned</div>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center shadow-card">
          <div className="text-2xl font-extrabold">{quizzes.length}</div>
          <div className="mt-0.5 text-xs font-medium text-stone-500">tests taken</div>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center shadow-card">
          <div className="text-2xl font-extrabold">{accuracy === null ? "—" : `${accuracy}%`}</div>
          <div className="mt-0.5 text-xs font-medium text-stone-500">test accuracy</div>
        </div>
      </section>

      {/* Study modes */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
          Study modes
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((mode) => (
            <Link
              key={mode.to}
              to={mode.to}
              className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-stone-300"
            >
              <div className="text-2xl">{mode.emoji}</div>
              <div className="mt-2 font-bold group-hover:text-emerald-700">{mode.title}</div>
              <p className="mt-0.5 text-sm text-stone-500">{mode.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent tests */}
      {recent.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
            Recent tests
          </h2>
          <ul className="mt-3 divide-y divide-stone-100 overflow-hidden rounded-2xl bg-white shadow-card">
            {recent.map((quiz, i) => {
              const pct = Math.round((quiz.correct / quiz.total) * 100);
              return (
                <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-medium">
                    {quiz.level} · {formatDate(quiz.date)}
                  </span>
                  <span
                    className={`font-bold ${
                      pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-600"
                    }`}
                  >
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
