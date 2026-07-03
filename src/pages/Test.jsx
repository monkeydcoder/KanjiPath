import { useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { LEVELS } from "../data";
import { vocabPoolForLevel } from "../data/vocab";
import { grammarForLevel } from "../data/grammar";
import { onyomiRomaji } from "../romaji";
import { ACCENTS, sample, shuffle } from "../utils";

// Vocabulary is quicker to recall than kanji, so its tests run longer.
const KANJI_COUNTS = [5, 10, 15];
const VOCAB_COUNTS = [30, 40, 50];
const GRAMMAR_COUNTS = [10, 15, 20];

const TEST_MODES = [
  { id: "kanji", label: "Kanji", emoji: "🈷️" },
  { id: "vocab", label: "Vocabulary", emoji: "🗂️" },
  { id: "grammar", label: "Grammar", emoji: "📐" },
];

const MODE_DESCRIPTIONS = {
  kanji: "Meanings, readings, recognition, and fill-the-sentence questions.",
  vocab: "Word meanings, readings, and recognition.",
  grammar: "Match grammar patterns to what they express.",
};

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

/** Short English label for a grammar pattern ("は — Topic marker" → "Topic marker"). */
function grammarLabel(lesson) {
  return lesson.title.includes("—")
    ? lesson.title.split("—").pop().trim()
    : lesson.short;
}

/**
 * Balanced but unpredictable question types: every type appears roughly
 * equally often, in a shuffled order (the old fixed rotation let you
 * anticipate what each question would ask).
 */
function typeSequence(types, count) {
  return shuffle(Array.from({ length: count }, (_, i) => types[i % types.length]));
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

/** Build a mixed kanji quiz from `items`, with distractors from `allKanji`. */
function buildKanjiQuestions(items, allKanji, count) {
  const picked = sample(items, count);
  const seq = typeSequence(["meaning", "reading", "kanji", "cloze"], picked.length);
  return picked.map((kanji, i) => {
    let type = seq[i];
    // Cloze only works when the kanji appears exactly once in its sentence
    // (日 appears twice in 日曜日, so blanking it would look broken).
    const sentenceText = kanji.sentence.parts.map((p) => p[0]).join("");
    if (type === "cloze" && sentenceText.split(kanji.char).length - 1 !== 1) {
      type = "meaning";
    }
    const rest = allKanji.filter((k) => k.char !== kanji.char);
    const group = kanjiPos(kanji);
    const base = { mode: "kanji", kanji, type };
    if (type === "meaning") {
      return {
        ...base,
        prompt: "What does this kanji mean?",
        glyph: kanji.char,
        glyphKind: "kanji",
        correct: kanji.meaning,
        optionsKind: "en",
        options: shuffle([
          kanji.meaning,
          ...pickDistractors(rest, 3, { getValue: (k) => k.meaning, correct: kanji.meaning, getGroup: kanjiPos, group }),
        ]),
      };
    }
    if (type === "reading") {
      const correct = mainReading(kanji);
      return {
        ...base,
        prompt: "Which is a reading of this kanji?",
        glyph: kanji.char,
        glyphKind: "kanji",
        correct,
        optionsKind: "jp",
        options: shuffle([
          correct,
          ...pickDistractors(rest, 3, { getValue: mainReading, correct, getGroup: kanjiPos, group }),
        ]),
      };
    }
    if (type === "cloze") {
      return {
        ...base,
        prompt: "Which kanji completes the sentence?",
        glyph: sentenceText.replace(kanji.char, "＿"),
        glyphKind: "sentence",
        hint: kanji.sentence.en,
        correct: kanji.char,
        optionsKind: "glyph",
        options: shuffle([
          kanji.char,
          ...pickDistractors(rest, 3, { getValue: (k) => k.char, correct: kanji.char, getGroup: kanjiPos, group }),
        ]),
      };
    }
    return {
      ...base,
      prompt: `Which kanji means “${kanji.meaning}”?`,
      glyph: null,
      correct: kanji.char,
      optionsKind: "glyph",
      options: shuffle([
        kanji.char,
        ...pickDistractors(rest, 3, { getValue: (k) => k.char, correct: kanji.char, getGroup: kanjiPos, group }),
      ]),
    };
  });
}

/** Build a mixed vocabulary quiz from `items`, with distractors from `pool`. */
function buildVocabQuestions(items, pool, count) {
  const picked = sample(items, count);
  const seq = typeSequence(["meaning", "jp", "reading"], picked.length);
  return picked.map((word, i) => {
    let type = seq[i];
    const rest = pool.filter((w) => w.jp !== word.jp);
    const group = word.topic;
    const byTopic = (w) => w.topic;
    // A reading question is only fair if its category can supply same-category
    // reading distractors. Kana-only words (r === jp), or a category with too
    // few kanji-written peers (e.g. お願いします among kana greetings), fall back
    // to a meaning question — which always has plenty of same-category options.
    if (type === "reading") {
      const sameCatReadings = new Set(
        rest.filter((w) => w.topic === group && w.r !== w.jp && w.r !== word.r).map((w) => w.r)
      );
      if (word.r === word.jp || sameCatReadings.size < 3) type = "meaning";
    }
    const base = { mode: "vocab", word, type };
    if (type === "meaning") {
      return {
        ...base,
        prompt: "What does this word mean?",
        glyph: word.jp,
        glyphKind: "jp",
        correct: word.en,
        optionsKind: "en",
        options: shuffle([
          word.en,
          ...pickDistractors(rest, 3, { getValue: (w) => w.en, correct: word.en, getGroup: byTopic, group }),
        ]),
      };
    }
    if (type === "reading") {
      return {
        ...base,
        prompt: "How do you read this word?",
        glyph: word.jp,
        glyphKind: "jp",
        correct: word.r,
        optionsKind: "jp",
        options: shuffle([
          word.r,
          ...pickDistractors(rest.filter((w) => w.r !== w.jp), 3, {
            getValue: (w) => w.r,
            correct: word.r,
            getGroup: byTopic,
            group,
          }),
        ]),
      };
    }
    return {
      ...base,
      prompt: `Which word means “${word.en}”?`,
      glyph: null,
      correct: word.jp,
      optionsKind: "jp",
      options: shuffle([
        word.jp,
        ...pickDistractors(rest, 3, { getValue: (w) => w.jp, correct: word.jp, getGroup: byTopic, group }),
      ]),
    };
  });
}

/** Build a grammar quiz from `items`, with distractors from `all`. */
function buildGrammarQuestions(items, all, count) {
  const picked = sample(items, count);
  const seq = typeSequence(["meaning", "pattern"], picked.length);
  return picked.map((lesson, i) => {
    const type = seq[i];
    const rest = all.filter((g) => g.id !== lesson.id);
    const group = lesson.topic;
    const byTopic = (g) => g.topic;
    const label = grammarLabel(lesson);
    const base = { mode: "grammar", lesson, type };
    if (type === "meaning") {
      return {
        ...base,
        prompt: "What does this pattern express?",
        glyph: lesson.jp,
        glyphKind: "jp",
        correct: label,
        optionsKind: "en",
        options: shuffle([
          label,
          ...pickDistractors(rest, 3, { getValue: grammarLabel, correct: label, getGroup: byTopic, group }),
        ]),
      };
    }
    return {
      ...base,
      prompt: `Which pattern means “${label}”?`,
      glyph: null,
      correct: lesson.jp,
      optionsKind: "jp",
      options: shuffle([
        lesson.jp,
        ...pickDistractors(rest, 3, { getValue: (g) => g.jp, correct: lesson.jp, getGroup: byTopic, group }),
      ]),
    };
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
        {kanji.on && <span className="text-xs opacity-70"> ({onyomiRomaji(kanji.on)})</span>}
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

function GrammarExplanation({ lesson }) {
  const ex = lesson.examples[0];
  return (
    <div className="mt-4 rounded-2xl bg-stone-100/80 p-4 text-sm dark:bg-night-soft">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-jp text-xl font-bold">{lesson.jp}</span>
        <span className="font-bold">{grammarLabel(lesson)}</span>
      </div>
      <p className="mt-2 font-jp font-semibold text-stone-600 dark:text-stone-300">
        {lesson.structure}
      </p>
      <p className="mt-2 text-stone-600 dark:text-stone-300">
        <span className="font-jp">{ex.jp}</span> — {ex.en}
      </p>
    </div>
  );
}

function Explanation({ question }) {
  if (question.mode === "vocab") return <VocabExplanation word={question.word} />;
  if (question.mode === "grammar") return <GrammarExplanation lesson={question.lesson} />;
  return <KanjiExplanation kanji={question.kanji} />;
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
  const { levelData, learnedSet, recordQuiz, noteTestAnswer, bumpActivity } = useStudy();
  const accent = ACCENTS[levelData.accent];

  const [phase, setPhase] = useState("setup"); // setup | quiz | results
  const [mode, setMode] = useState("kanji"); // kanji | vocab | grammar
  const [pool, setPool] = useState("all");
  const [count, setCount] = useState(10);
  // The level is frozen when a quiz starts, so flipping the header N5/N4
  // toggle mid-test can't mislabel the result or change the questions' context.
  const [quizLevel, setQuizLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);

  const learnedKanji = useMemo(
    () => levelData.kanji.filter((k) => learnedSet.has(k.char)),
    [levelData, learnedSet]
  );
  const canUseLearned = learnedKanji.length >= 4;

  const counts =
    mode === "vocab" ? VOCAB_COUNTS : mode === "grammar" ? GRAMMAR_COUNTS : KANJI_COUNTS;

  const selectMode = (id) => {
    setMode(id);
    setCount(id === "vocab" ? 40 : id === "grammar" ? 15 : 10);
  };

  const beginQuiz = (built, level) => {
    setQuizLevel(level);
    setQuestions(built);
    setCurrent(0);
    setPicked(null);
    setAnswers([]);
    setPhase("quiz");
  };

  const start = () => {
    const level = levelData.id;
    let built;
    if (mode === "vocab") {
      const vocab = vocabPoolForLevel(level);
      built = buildVocabQuestions(vocab, vocab, Math.min(count, vocab.length));
    } else if (mode === "grammar") {
      const lessons = grammarForLevel(level);
      built = buildGrammarQuestions(lessons, lessons, Math.min(count, lessons.length));
    } else {
      const source = pool === "learned" && canUseLearned ? learnedKanji : levelData.kanji;
      built = buildKanjiQuestions(source, levelData.kanji, Math.min(count, source.length));
    }
    beginQuiz(built, level);
  };

  /** Rebuild a quiz from only the questions missed this round. */
  const retryMissed = () => {
    const missed = questions.filter((_, i) => !answers[i]);
    let built;
    if (mode === "vocab") {
      built = buildVocabQuestions(missed.map((q) => q.word), vocabPoolForLevel(quizLevel), missed.length);
    } else if (mode === "grammar") {
      built = buildGrammarQuestions(missed.map((q) => q.lesson), grammarForLevel(quizLevel), missed.length);
    } else {
      built = buildKanjiQuestions(missed.map((q) => q.kanji), LEVELS[quizLevel].kanji, missed.length);
    }
    beginQuiz(built, quizLevel);
  };

  const pick = (option) => {
    if (picked !== null) return;
    const q = questions[current];
    const ok = option === q.correct;
    setPicked(option);
    setAnswers((a) => [...a, ok]);
    // Feed the answer into spaced repetition: wrong answers surface the item
    // in the review deck; right answers promote items already under review.
    if (q.mode === "kanji") noteTestAnswer("k:" + q.kanji.char, ok);
    else if (q.mode === "vocab") noteTestAnswer("v:" + q.word.jp, ok);
    else bumpActivity();
  };

  const next = () => {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setPicked(null);
    } else {
      recordQuiz({
        level: quizLevel,
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
          {MODE_DESCRIPTIONS[mode]} You'll see the correct answer and a short
          explanation after each question.
        </p>

        <div className="card mt-6 p-6">
          <h2 className="section-label">What to test</h2>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {TEST_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => selectMode(m.id)}
                className={`rounded-2xl border px-3 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                  mode === m.id
                    ? `${accent.border} ${accent.soft} ${accent.softText} ring-1 ${accent.ring}`
                    : CHOICE_IDLE
                }`}
              >
                {m.emoji} {m.label}
                <span className="block text-xs font-normal opacity-70 [font-variant-numeric:tabular-nums]">
                  {m.id === "kanji"
                    ? `${levelData.kanji.length} kanji`
                    : m.id === "vocab"
                      ? `${vocabPoolForLevel(levelData.id).length} words`
                      : `${grammarForLevel(levelData.id).length} lessons`}
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

  // Level (and its accent) are frozen for the quiz and results phases.
  const quizAccent = ACCENTS[LEVELS[quizLevel ?? levelData.id].accent];

  // ---- Results ----
  if (phase === "results") {
    const correctCount = answers.filter(Boolean).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    const missed = questions.filter((_, i) => !answers[i]);
    return (
      <div className="rise-in mx-auto max-w-lg text-center">
        <div className="card p-8">
          <ScoreRing pct={pct} strokeClass={quizAccent.stroke} />
          <h1 className="mt-4 font-display text-2xl font-bold">
            {correctCount} / {questions.length} correct {pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "🌱"}
          </h1>
          <p className="mt-1 text-stone-500 dark:text-night-mute">
            {pct >= 80
              ? "Excellent! These are sticking."
              : pct >= 50
                ? "Good progress — review the missed ones below."
                : "Keep going — missed items are now queued in your review deck."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {missed.length > 0 && (
              <button onClick={retryMissed} className="btn-soft px-6 py-2.5">
                Retry missed ({missed.length})
              </button>
            )}
            <button
              onClick={() => setPhase("setup")}
              className={`btn-grad px-6 py-2.5 ${quizAccent.grad} ${quizAccent.gradHover}`}
            >
              New test
            </button>
          </div>
        </div>

        {missed.length > 0 && (
          <div className="mt-6 text-left">
            <h2 className="section-label">
              {mode === "vocab" ? "Words to review" : mode === "grammar" ? "Patterns to review" : "Kanji to review"}
            </h2>
            <div className="mt-3 space-y-3">
              {missed.map((q) => (
                <Explanation
                  key={(q.mode === "vocab" ? q.word.jp : q.mode === "grammar" ? q.lesson.id : q.kanji.char) + q.type}
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
  const glyphOptions = question.optionsKind === "glyph";

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
          className={`h-full rounded-full transition-all duration-500 ${quizAccent.bar}`}
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      <div className="card mt-6 p-6">
        <p className="text-center">
          {question.glyph ? (
            <>
              <span
                className={
                  question.glyphKind === "kanji"
                    ? "font-kanji text-7xl font-bold"
                    : question.glyphKind === "sentence"
                      ? "font-jp text-2xl font-semibold leading-relaxed"
                      : "font-jp text-4xl font-bold sm:text-5xl"
                }
              >
                {question.glyph}
              </span>
              {question.hint && (
                <span className="mt-2 block text-sm italic text-stone-500 dark:text-night-mute">
                  “{question.hint}”
                </span>
              )}
              <span className="mt-3 block font-display text-base font-bold text-stone-600 dark:text-stone-300">
                {question.prompt}
              </span>
            </>
          ) : (
            <span className="font-display text-lg font-bold">{question.prompt}</span>
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
                  question.optionsKind === "jp"
                    ? "font-jp text-lg"
                    : glyphOptions
                      ? "justify-center text-center font-kanji text-3xl"
                      : "text-sm capitalize"
                }`}
              >
                {!glyphOptions && (
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
              className={`btn-grad mt-4 w-full py-3 ${quizAccent.grad} ${quizAccent.gradHover}`}
            >
              {current + 1 < questions.length ? "Next question →" : "See results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
