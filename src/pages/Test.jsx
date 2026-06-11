import { useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { ACCENTS, sample, shuffle } from "../utils";

const QUESTION_COUNTS = [5, 10, 15];

function mainReading(kanji) {
  return kanji.kun || kanji.on;
}

/** Build a mixed quiz from a kanji pool, with distractors from the same level. */
function buildQuestions(pool, allKanji, count) {
  const types = ["meaning", "reading", "kanji"];
  return sample(pool, count).map((kanji, i) => {
    const type = types[i % types.length];
    const others = sample(allKanji.filter((k) => k.char !== kanji.char), 3);
    let prompt, correct, options;
    if (type === "meaning") {
      prompt = `What does ${kanji.char} mean?`;
      correct = kanji.meaning;
      options = shuffle([correct, ...others.map((k) => k.meaning)]);
    } else if (type === "reading") {
      prompt = `Which is a reading of ${kanji.char}?`;
      correct = mainReading(kanji);
      options = shuffle([correct, ...others.map((k) => mainReading(k))]);
    } else {
      prompt = `Which kanji means “${kanji.meaning}”?`;
      correct = kanji.char;
      options = shuffle([correct, ...others.map((k) => k.char)]);
    }
    return { kanji, type, prompt, correct, options };
  });
}

function Explanation({ kanji }) {
  const word = kanji.words[0];
  return (
    <div className="mt-4 rounded-xl bg-stone-50 p-4 text-sm">
      <div className="flex items-baseline gap-3">
        <span className="font-jp text-3xl font-bold">{kanji.char}</span>
        <span className="font-semibold capitalize">{kanji.meaning}</span>
      </div>
      <p className="mt-2 text-stone-600">
        <span className="font-semibold">Onyomi:</span>{" "}
        <span className="font-jp">{kanji.on || "—"}</span>
        {" · "}
        <span className="font-semibold">Kunyomi:</span>{" "}
        <span className="font-jp">{kanji.kun || "—"}</span>
      </p>
      <p className="mt-1 text-stone-600">
        <span className="font-semibold">Example:</span>{" "}
        <span className="font-jp">{word.w}（{word.r}）</span> — {word.m}
      </p>
    </div>
  );
}

export default function Test() {
  const { levelData, learnedSet, recordQuiz } = useStudy();
  const accent = ACCENTS[levelData.accent];

  const [phase, setPhase] = useState("setup"); // setup | quiz | results
  const [pool, setPool] = useState("all");
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);

  const learnedKanji = useMemo(
    () => levelData.kanji.filter((k) => learnedSet.has(k.char)),
    [levelData, learnedSet]
  );
  const canUseLearned = learnedKanji.length >= 4;

  const start = () => {
    const sourcePool = pool === "learned" && canUseLearned ? learnedKanji : levelData.kanji;
    const n = Math.min(count, sourcePool.length);
    setQuestions(buildQuestions(sourcePool, levelData.kanji, n));
    setCurrent(0);
    setPicked(null);
    setAnswers([]);
    setPhase("quiz");
  };

  const pick = (option) => {
    if (picked !== null) return;
    setPicked(option);
    setAnswers((a) => [...a, option === questions[current].correct]);
  };

  const next = () => {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setPicked(null);
    } else {
      recordQuiz({
        level: levelData.id,
        correct: answers.filter(Boolean).length,
        total: questions.length,
        date: new Date().toISOString(),
      });
      setPhase("results");
    }
  };

  // ---- Setup ----
  if (phase === "setup") {
    return (
      <div className="rise-in mx-auto max-w-lg">
        <h1 className="text-2xl font-extrabold tracking-tight">Test · {levelData.title}</h1>
        <p className="mt-1 text-sm text-stone-500">
          Mixed multiple-choice questions: meanings, readings, and kanji recognition.
          You'll see the correct answer and a short explanation after each question.
        </p>

        <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Kanji pool</h2>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setPool("all")}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold ${
                pool === "all" ? `${accent.border} ${accent.soft} ${accent.softText}` : "border-stone-200 text-stone-600"
              }`}
            >
              All {levelData.kanji.length} kanji
            </button>
            <button
              onClick={() => canUseLearned && setPool("learned")}
              disabled={!canUseLearned}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-40 ${
                pool === "learned" ? `${accent.border} ${accent.soft} ${accent.softText}` : "border-stone-200 text-stone-600"
              }`}
            >
              Learned only ({learnedKanji.length})
            </button>
          </div>
          {!canUseLearned && (
            <p className="mt-2 text-xs text-stone-400">
              Mark at least 4 kanji as learned to test only what you've studied.
            </p>
          )}

          <h2 className="mt-5 text-sm font-semibold uppercase tracking-wide text-stone-400">Questions</h2>
          <div className="mt-2 flex gap-2">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold ${
                  count === n ? `${accent.border} ${accent.soft} ${accent.softText}` : "border-stone-200 text-stone-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            onClick={start}
            className={`mt-6 w-full rounded-full py-3 font-semibold text-white ${accent.solid} ${accent.solidHover}`}
          >
            Start test
          </button>
        </div>
      </div>
    );
  }

  // ---- Results ----
  if (phase === "results") {
    const correctCount = answers.filter(Boolean).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    const missed = questions.filter((_, i) => !answers[i]);
    return (
      <div className="rise-in mx-auto max-w-lg text-center">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-card">
          <div className="text-5xl">{pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "🌱"}</div>
          <h1 className="mt-3 text-2xl font-extrabold">
            {correctCount} / {questions.length} correct
          </h1>
          <p className="mt-1 text-stone-500">
            {pct >= 80
              ? "Excellent! These kanji are sticking."
              : pct >= 50
                ? "Good progress — review the missed ones below."
                : "Keep going — revisit these kanji in the Learn section."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setPhase("setup")}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold text-white ${accent.solid} ${accent.solidHover}`}
            >
              Test again
            </button>
          </div>
        </div>

        {missed.length > 0 && (
          <div className="mt-6 text-left">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
              Kanji to review
            </h2>
            <div className="mt-3 space-y-3">
              {missed.map((q) => (
                <Explanation key={q.kanji.char + q.type} kanji={q.kanji} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- Quiz ----
  const question = questions[current];
  const isJapaneseOptions = question.type !== "meaning";

  return (
    <div className="rise-in mx-auto max-w-lg" key={current}>
      <div className="flex items-center justify-between text-sm font-medium text-stone-400">
        <span>
          Question {current + 1} of {questions.length}
        </span>
        <span>{answers.filter(Boolean).length} correct so far</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full rounded-full transition-all ${accent.bar}`}
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-card">
        <p className="text-center text-lg font-bold">
          {question.type !== "kanji" ? (
            <>
              <span className="font-jp text-6xl">{question.kanji.char}</span>
              <span className="mt-3 block text-base font-semibold text-stone-600">
                {question.prompt.replace(question.kanji.char, "this kanji")}
              </span>
            </>
          ) : (
            question.prompt
          )}
        </p>

        <div className="mt-5 grid gap-2.5">
          {question.options.map((option) => {
            let cls = "border-stone-200 bg-white hover:border-stone-400";
            if (picked !== null) {
              if (option === question.correct) cls = "border-emerald-500 bg-emerald-50 text-emerald-800";
              else if (option === picked) cls = "border-rose-400 bg-rose-50 text-rose-700";
              else cls = "border-stone-200 bg-white opacity-50";
            }
            return (
              <button
                key={option}
                onClick={() => pick(option)}
                disabled={picked !== null}
                className={`rounded-xl border-2 px-4 py-3 text-left font-semibold capitalize transition-colors ${cls} ${
                  isJapaneseOptions ? "font-jp text-lg" : "text-sm"
                } ${question.type === "kanji" ? "text-center text-3xl" : ""}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="rise-in">
            <p className={`mt-4 font-bold ${picked === question.correct ? "text-emerald-600" : "text-rose-600"}`}>
              {picked === question.correct ? "Correct! ✓" : "Not quite — the answer is highlighted above."}
            </p>
            <Explanation kanji={question.kanji} />
            <button
              onClick={next}
              className={`mt-4 w-full rounded-full py-3 font-semibold text-white ${accent.solid} ${accent.solidHover}`}
            >
              {current + 1 < questions.length ? "Next question →" : "See results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
