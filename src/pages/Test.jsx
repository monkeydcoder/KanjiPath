import { useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { VOCAB_CATEGORIES } from "../data/vocab";
import { ACCENTS, sample, shuffle } from "../utils";

// Vocabulary is quicker to recall than kanji, so its tests run longer.
const KANJI_COUNTS = [5, 10, 15];
const VOCAB_COUNTS = [30, 40, 50];

const TEST_MODES = [
  { id: "kanji", label: "Kanji", emoji: "🈷️" },
  { id: "vocab", label: "Vocabulary", emoji: "🗂️" },
];

const OPTION_IDLE =
  "border-line bg-card hover:border-stone-400 dark:border-night-line dark:bg-night-card dark:hover:border-night-mute";
const OPTION_CORRECT =
  "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200";
const OPTION_WRONG =
  "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300";
const OPTION_DIMMED = "border-line bg-card opacity-40 dark:border-night-line dark:bg-night-card";

const CHOICE_IDLE =
  "border-line text-stone-600 hover:border-stone-400 dark:border-night-line dark:text-stone-300 dark:hover:border-night-mute";

function mainReading(kanji) {
  return kanji.kun || kanji.on;
}

// Coarse part of speech for a kanji, used to keep distractors the same type
// (verbs with verbs, adjectives with adjectives) instead of trivially
// eliminable. Verbs read "to …"; i-adjectives show okurigana like "(い)".
function kanjiPos(kanji) {
  if (/^to\s/i.test(kanji.meaning.trim())) return "verb";
  if (kanji.kun.includes("い)")) return "adj";
  return "noun";
}

/**
 * Pick n distractor values, preferring items in the SAME group as the answer
 * (same vocabulary topic, or same kanji part of speech) so the options can't
 * be eliminated by type alone — much closer to real JLPT questions. Falls back
 * to the rest of the pool only if a group is too small. All returned values are
 * distinct and never equal the correct answer.
 */
function pickDistractors(pool, n, { getValue, correct, getGroup, group }) {
  const seen = new Set([correct]);
  const out = [];
  const take = (items) => {
    for (const item of items) {
      if (out.length === n) return;
      const value = getValue(item);
      if (seen.has(value)) continue;
      seen.add(value);
      out.push(value);
    }
  };
  take(shuffle(pool.filter((it) => getGroup(it) === group)));
  if (out.length < n) take(shuffle(pool.filter((it) => getGroup(it) !== group)));
  return out;
}

/** Build a mixed kanji quiz, with distractors from the same level. */
function buildKanjiQuestions(pool, allKanji, count) {
  const types = ["meaning", "reading", "kanji"];
  return sample(pool, count).map((kanji, i) => {
    const type = types[i % types.length];
    const rest = allKanji.filter((k) => k.char !== kanji.char);
    const group = kanjiPos(kanji);
    let prompt, correct, options;
    if (type === "meaning") {
      prompt = `What does ${kanji.char} mean?`;
      correct = kanji.meaning;
      options = shuffle([
        correct,
        ...pickDistractors(rest, 3, { getValue: (k) => k.meaning, correct, getGroup: kanjiPos, group }),
      ]);
    } else if (type === "reading") {
      prompt = `Which is a reading of ${kanji.char}?`;
      correct = mainReading(kanji);
      options = shuffle([
        correct,
        ...pickDistractors(rest, 3, { getValue: mainReading, correct, getGroup: kanjiPos, group }),
      ]);
    } else {
      prompt = `Which kanji means “${kanji.meaning}”?`;
      correct = kanji.char;
      options = shuffle([
        correct,
        ...pickDistractors(rest, 3, { getValue: (k) => k.char, correct, getGroup: kanjiPos, group }),
      ]);
    }
    return { mode: "kanji", kanji, type, prompt, correct, options };
  });
}

/** Build a mixed vocabulary quiz: meaning, reading, and reverse recognition. */
function buildVocabQuestions(pool, count) {
  const types = ["meaning", "jp", "reading"];
  return sample(pool, count).map((word, i) => {
    let type = types[i % types.length];
    // Kana-only words have no separate reading to quiz — ask meaning instead.
    if (type === "reading" && word.r === word.jp) type = "meaning";
    const rest = pool.filter((w) => w.jp !== word.jp);
    const group = word.topic;
    const byTopic = (w) => w.topic;
    let prompt, correct, options;
    if (type === "meaning") {
      prompt = `What does ${word.jp} mean?`;
      correct = word.en;
      options = shuffle([
        correct,
        ...pickDistractors(rest, 3, { getValue: (w) => w.en, correct, getGroup: byTopic, group }),
      ]);
    } else if (type === "reading") {
      prompt = `How do you read ${word.jp}?`;
      correct = word.r;
      options = shuffle([
        correct,
        ...pickDistractors(rest.filter((w) => w.r !== w.jp), 3, {
          getValue: (w) => w.r,
          correct,
          getGroup: byTopic,
          group,
        }),
      ]);
    } else {
      prompt = `Which word means “${word.en}”?`;
      correct = word.jp;
      options = shuffle([
        correct,
        ...pickDistractors(rest, 3, { getValue: (w) => w.jp, correct, getGroup: byTopic, group }),
      ]);
    }
    return { mode: "vocab", word, type, prompt, correct, options };
  });
}

function KanjiExplanation({ kanji }) {
  const word = kanji.words[0];
  return (
    <div className="mt-4 rounded-2xl bg-stone-100/80 p-4 text-sm dark:bg-night-soft">
      <div className="flex items-baseline gap-3">
        <span className="font-kanji text-3xl font-bold">{kanji.char}</span>
        <span className="font-bold capitalize">{kanji.meaning}</span>
      </div>
      <p className="mt-2 text-stone-600 dark:text-stone-300">
        <span className="font-semibold">Onyomi:</span>{" "}
        <span className="font-jp">{kanji.on || "—"}</span>
        {" · "}
        <span className="font-semibold">Kunyomi:</span>{" "}
        <span className="font-jp">{kanji.kun || "—"}</span>
      </p>
      <p className="mt-1 text-stone-600 dark:text-stone-300">
        <span className="font-semibold">Example:</span>{" "}
        <span className="font-jp">{word.w}（{word.r}）</span> — {word.m}
      </p>
    </div>
  );
}

function VocabExplanation({ word }) {
  return (
    <div className="mt-4 rounded-2xl bg-stone-100/80 p-4 text-sm dark:bg-night-soft">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-jp text-2xl font-bold">{word.jp}</span>
        {word.r !== word.jp && (
          <span className="font-jp text-stone-500 dark:text-night-mute">{word.r}</span>
        )}
        <span className="font-bold">{word.en}</span>
      </div>
      <p className="mt-2 text-stone-600 dark:text-stone-300">
        <span aria-hidden>{word.emoji}</span>{" "}
        <span className="font-semibold">Topic:</span> {word.topic}
      </p>
    </div>
  );
}

function Explanation({ question }) {
  return question.mode === "vocab" ? (
    <VocabExplanation word={question.word} />
  ) : (
    <KanjiExplanation kanji={question.kanji} />
  );
}

/** Animated circular score indicator — purely presentational. */
function ScoreRing({ pct, strokeClass }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60" cy="60" r={radius} fill="none" strokeWidth="11"
          className="stroke-stone-200 dark:stroke-night-soft"
        />
        <circle
          cx="60" cy="60" r={radius} fill="none" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          style={{ "--ring-circumference": circumference }}
          className={`ring-fill ${strokeClass}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-3xl font-bold [font-variant-numeric:tabular-nums]">
          {pct}%
        </span>
      </div>
    </div>
  );
}

export default function Test() {
  const { levelData, learnedSet, recordQuiz } = useStudy();
  const accent = ACCENTS[levelData.accent];

  const [phase, setPhase] = useState("setup"); // setup | quiz | results
  const [mode, setMode] = useState("kanji"); // kanji | vocab
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

  // Every word of the current level, tagged with its topic for explanations.
  const vocabPool = useMemo(
    () =>
      VOCAB_CATEGORIES.flatMap((c) =>
        c.words[levelData.id].map((w) => ({ ...w, topic: c.title, emoji: c.emoji }))
      ),
    [levelData]
  );

  const counts = mode === "vocab" ? VOCAB_COUNTS : KANJI_COUNTS;

  const selectMode = (id) => {
    setMode(id);
    setCount(id === "vocab" ? 40 : 10);
  };

  const start = () => {
    let built;
    if (mode === "vocab") {
      built = buildVocabQuestions(vocabPool, Math.min(count, vocabPool.length));
    } else {
      const sourcePool = pool === "learned" && canUseLearned ? learnedKanji : levelData.kanji;
      built = buildKanjiQuestions(sourcePool, levelData.kanji, Math.min(count, sourcePool.length));
    }
    setQuestions(built);
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
        kind: mode,
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
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Test <span className={accent.text}>· {levelData.title}</span>
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-night-mute">
          {mode === "vocab"
            ? "Mixed multiple-choice questions on words: meanings, readings, and recognition."
            : "Mixed multiple-choice questions: meanings, readings, and kanji recognition."}{" "}
          You'll see the correct answer and a short explanation after each question.
        </p>

        <div className="card mt-6 p-6">
          <h2 className="section-label">What to test</h2>
          <div className="mt-2 flex gap-2">
            {TEST_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => selectMode(m.id)}
                className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                  mode === m.id
                    ? `${accent.border} ${accent.soft} ${accent.softText} ring-1 ${accent.ring}`
                    : CHOICE_IDLE
                }`}
              >
                {m.emoji} {m.label}
                <span className="block text-xs font-normal opacity-70 [font-variant-numeric:tabular-nums]">
                  {m.id === "kanji"
                    ? `${levelData.kanji.length} kanji`
                    : `${vocabPool.length} words`}
                </span>
              </button>
            ))}
          </div>

          {mode === "kanji" && (
            <>
              <h2 className="section-label mt-6">Kanji pool</h2>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setPool("all")}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                    pool === "all"
                      ? `${accent.border} ${accent.soft} ${accent.softText} ring-1 ${accent.ring}`
                      : CHOICE_IDLE
                  }`}
                >
                  All {levelData.kanji.length} kanji
                </button>
                <button
                  onClick={() => canUseLearned && setPool("learned")}
                  disabled={!canUseLearned}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-40 ${
                    pool === "learned"
                      ? `${accent.border} ${accent.soft} ${accent.softText} ring-1 ${accent.ring}`
                      : CHOICE_IDLE
                  }`}
                >
                  Learned only ({learnedKanji.length})
                </button>
              </div>
              {!canUseLearned && (
                <p className="mt-2 text-xs text-stone-400 dark:text-night-mute">
                  Mark at least 4 kanji as learned to test only what you've studied.
                </p>
              )}
            </>
          )}

          <h2 className="section-label mt-6">Questions</h2>
          <div className="mt-2 flex gap-2">
            {counts.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                  count === n
                    ? `${accent.border} ${accent.soft} ${accent.softText} ring-1 ${accent.ring}`
                    : CHOICE_IDLE
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            onClick={start}
            className={`btn-grad mt-6 w-full py-3 ${accent.grad} ${accent.gradHover}`}
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
        <div className="card p-8">
          <ScoreRing pct={pct} strokeClass={accent.stroke} />
          <h1 className="mt-4 font-display text-2xl font-bold">
            {correctCount} / {questions.length} correct {pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "🌱"}
          </h1>
          <p className="mt-1 text-stone-500 dark:text-night-mute">
            {pct >= 80
              ? "Excellent! These are sticking."
              : pct >= 50
                ? "Good progress — review the missed ones below."
                : mode === "vocab"
                  ? "Keep going — revisit these words in the Vocabulary section."
                  : "Keep going — revisit these kanji in the Learn section."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setPhase("setup")}
              className={`btn-grad px-6 py-2.5 ${accent.grad} ${accent.gradHover}`}
            >
              Test again
            </button>
          </div>
        </div>

        {missed.length > 0 && (
          <div className="mt-6 text-left">
            <h2 className="section-label">{mode === "vocab" ? "Words to review" : "Kanji to review"}</h2>
            <div className="mt-3 space-y-3">
              {missed.map((q) => (
                <Explanation
                  key={(q.mode === "vocab" ? q.word.jp : q.kanji.char) + q.type}
                  question={q}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- Quiz ----
  const question = questions[current];
  const isVocab = question.mode === "vocab";
  // Reverse-recognition questions ("which word/kanji means …") show only the prompt.
  const showGlyph = isVocab ? question.type !== "jp" : question.type !== "kanji";
  const glyph = isVocab ? question.word.jp : question.kanji.char;
  const isJapaneseOptions = question.type !== "meaning";
  const centeredKanjiOptions = !isVocab && question.type === "kanji";

  return (
    <div className="rise-in mx-auto max-w-lg" key={current}>
      <div className="flex items-center justify-between text-sm font-semibold text-stone-400 [font-variant-numeric:tabular-nums] dark:text-night-mute">
        <span>
          Question {current + 1} of {questions.length}
        </span>
        <span>{answers.filter(Boolean).length} correct so far</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200/80 dark:bg-night-soft">
        <div
          className={`h-full rounded-full transition-all duration-500 ${accent.bar}`}
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      <div className="card mt-6 p-6">
        <p className="text-center text-lg font-bold">
          {showGlyph ? (
            <>
              <span className={isVocab ? "font-jp text-4xl sm:text-5xl" : "font-kanji text-7xl"}>
                {glyph}
              </span>
              <span className="mt-3 block font-display text-base font-bold text-stone-600 dark:text-stone-300">
                {question.prompt.replace(glyph, isVocab ? "this word" : "this kanji")}
              </span>
            </>
          ) : (
            <span className="font-display">{question.prompt}</span>
          )}
        </p>

        <div className="mt-5 grid gap-2.5">
          {question.options.map((option, i) => {
            let cls = OPTION_IDLE;
            if (picked !== null) {
              if (option === question.correct) cls = OPTION_CORRECT;
              else if (option === picked) cls = OPTION_WRONG;
              else cls = OPTION_DIMMED;
            }
            return (
              <button
                key={option}
                onClick={() => pick(option)}
                disabled={picked !== null}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-all duration-200 active:scale-[0.99] ${cls} ${
                  isJapaneseOptions ? "font-jp text-lg" : "text-sm capitalize"
                } ${centeredKanjiOptions ? "justify-center text-center font-kanji text-3xl" : ""}`}
              >
                {!centeredKanjiOptions && (
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-stone-100 font-sans text-xs font-bold text-stone-500 dark:bg-night-soft dark:text-night-mute">
                    {String.fromCharCode(65 + i)}
                  </span>
                )}
                {option}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="rise-in">
            <p
              className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold ${
                picked === question.correct
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
              }`}
            >
              {picked === question.correct
                ? "Correct! ✓"
                : "Not quite — the answer is highlighted above."}
            </p>
            <Explanation question={question} />
            <button
              onClick={next}
              className={`btn-grad mt-4 w-full py-3 ${accent.grad} ${accent.gradHover}`}
            >
              {current + 1 < questions.length ? "Next question →" : "See results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
