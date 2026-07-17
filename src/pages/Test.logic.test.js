import { describe, expect, it } from "vitest";
import { LEVELS } from "../data";
import { grammarForLevel } from "../data/grammar";
import { vocabPoolForLevel } from "../data/vocab";
import {
  buildGrammarQuestions,
  buildKanjiQuestions,
  buildOptions,
  buildVocabQuestions,
  pickDistractors,
  typeSequence,
} from "./Test";

describe("typeSequence", () => {
  it("returns `count` items, each drawn from `types`, in balanced proportion", () => {
    const types = ["a", "b", "c"];
    const seq = typeSequence(types, 9);
    expect(seq).toHaveLength(9);
    for (const t of seq) expect(types).toContain(t);
    const counts = types.map((t) => seq.filter((x) => x === t).length);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  });
});

describe("pickDistractors", () => {
  const pool = Array.from({ length: 10 }, (_, i) => ({
    value: `v${i}`,
    group: i % 2 === 0 ? "a" : "b",
  }));

  it("returns n distinct values, never equal to the correct answer", () => {
    const out = pickDistractors(pool, 3, {
      getValue: (x) => x.value,
      correct: "v0",
      getGroup: (x) => x.group,
      group: "a",
    });
    expect(out).toHaveLength(3);
    expect(new Set(out).size).toBe(3);
    expect(out).not.toContain("v0");
  });

  it("prefers same-group items, falling back to the rest of the pool only once the group runs out", () => {
    const smallPool = [
      { value: "a1", group: "a" },
      { value: "a2", group: "a" },
      { value: "b1", group: "b" },
      { value: "b2", group: "b" },
    ];
    const out = pickDistractors(smallPool, 3, {
      getValue: (x) => x.value,
      correct: "a0",
      getGroup: (x) => x.group,
      group: "a",
    });
    expect(out).toHaveLength(3);
    expect(out).toEqual(expect.arrayContaining(["a1", "a2"]));
  });
});

describe("buildOptions", () => {
  it("shuffles the correct answer in among 3 unique distractors", () => {
    const pool = Array.from({ length: 10 }, (_, i) => ({ value: `v${i}`, group: "a" }));
    const options = buildOptions(
      "correct",
      pool,
      "a",
      (x) => x.value,
      (x) => x.group
    );
    expect(options).toHaveLength(4);
    expect(options).toContain("correct");
    expect(new Set(options).size).toBe(4);
  });
});

describe("buildKanjiQuestions (real N5 data)", () => {
  const allKanji = LEVELS.N5.kanji;

  it("builds `count` questions, each with the correct answer among 4 unique options", () => {
    const questions = buildKanjiQuestions(allKanji, allKanji, 15);
    expect(questions).toHaveLength(15);
    for (const q of questions) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.correct);
      expect(new Set(q.options).size).toBe(4);
    }
  });

  it("only asks a cloze question when the kanji appears exactly once in its example sentence", () => {
    const questions = buildKanjiQuestions(allKanji, allKanji, allKanji.length);
    const clozeQuestions = questions.filter((q) => q.type === "cloze");
    expect(clozeQuestions.length).toBeGreaterThan(0); // sanity: cloze actually gets picked sometimes
    for (const q of clozeQuestions) {
      const text = q.kanji.sentence.parts.map((p) => p[0]).join("");
      expect(text.split(q.kanji.char).length - 1).toBe(1);
    }
  });
});

describe("buildVocabQuestions (real N5 data)", () => {
  const pool = vocabPoolForLevel("N5");

  it("builds `count` questions, each with the correct answer among 4 unique options", () => {
    const questions = buildVocabQuestions(pool, pool, 20);
    expect(questions).toHaveLength(20);
    for (const q of questions) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.correct);
      expect(new Set(q.options).size).toBe(4);
    }
  });

  it("never asks a reading question for a kana-only word", () => {
    const questions = buildVocabQuestions(pool, pool, pool.length);
    const readingQuestions = questions.filter((q) => q.type === "reading");
    expect(readingQuestions.length).toBeGreaterThan(0); // sanity: reading actually gets picked sometimes
    for (const q of readingQuestions) expect(q.word.r).not.toBe(q.word.jp);
  });
});

describe("buildGrammarQuestions (real N5 data)", () => {
  const lessons = grammarForLevel("N5");

  it("builds `count` questions, each with the correct answer among 4 unique options", () => {
    const questions = buildGrammarQuestions(lessons, lessons, 15);
    expect(questions).toHaveLength(15);
    for (const q of questions) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.correct);
      expect(new Set(q.options).size).toBe(4);
    }
  });
});
