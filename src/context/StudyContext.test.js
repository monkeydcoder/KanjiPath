import { describe, expect, it } from "vitest";
import { localDateKey } from "../utils";
import { bumped, defaultProgress, demoted, promoted, sanitizeProgress } from "./StudyContext";

const DAY_MS = 86400000;

function daysAgoKey(n) {
  return localDateKey(new Date(Date.now() - n * DAY_MS));
}

describe("defaultProgress", () => {
  it("returns a fresh, versioned, empty progress object", () => {
    expect(defaultProgress()).toEqual({
      version: 1,
      level: "N5",
      learned: [],
      quizzes: [],
      srs: {},
      activity: {},
    });
  });
});

describe("sanitizeProgress", () => {
  it("falls back to defaults for null/non-object input", () => {
    expect(sanitizeProgress(null)).toEqual(defaultProgress());
    expect(sanitizeProgress("nope")).toEqual(defaultProgress());
    expect(sanitizeProgress(undefined)).toEqual(defaultProgress());
  });

  it("keeps valid entries and drops malformed ones, field by field", () => {
    const result = sanitizeProgress({
      level: "N4",
      learned: ["水", "火", 5, null, ""],
      quizzes: [
        { level: "N5", kind: "kanji", correct: 8, total: 10, date: "2026-01-01T00:00:00.000Z" },
        { level: "N5", kind: "kanji", correct: "x", total: 10, date: "bad-date" },
      ],
      srs: {
        "k:水": { box: 2, due: 12345 },
        "k:火": { box: 99, due: 1 }, // out-of-range box
        "k:木": "not-an-object",
      },
      activity: { "2026-01-01": 3, "not-a-date": 5, "2026-01-02": -1 },
    });

    expect(result.version).toBe(1);
    expect(result.level).toBe("N4");
    expect(result.learned).toEqual(["水", "火"]);
    expect(result.quizzes).toEqual([
      { level: "N5", kind: "kanji", correct: 8, total: 10, date: "2026-01-01T00:00:00.000Z" },
    ]);
    expect(result.srs).toEqual({ "k:水": { box: 2, due: 12345 } });
    expect(result.activity).toEqual({ "2026-01-01": 3 });
  });

  it("defaults level to N5 unless it's exactly 'N4'", () => {
    expect(sanitizeProgress({ level: "N3" }).level).toBe("N5");
    expect(sanitizeProgress({}).level).toBe("N5");
  });

  it("caps quizzes at the most recent 50", () => {
    const quizzes = Array.from({ length: 55 }, (_, i) => ({
      level: "N5",
      kind: "kanji",
      correct: i,
      total: 10,
      date: "2026-01-01T00:00:00.000Z",
    }));
    const result = sanitizeProgress({ quizzes });
    expect(result.quizzes).toHaveLength(50);
    expect(result.quizzes[0].correct).toBe(5); // oldest 5 dropped
    expect(result.quizzes[49].correct).toBe(54);
  });

  it("caps activity at the most recent 120 days", () => {
    const activity = {};
    for (let i = 0; i < 130; i++) activity[daysAgoKey(i)] = 1;
    const result = sanitizeProgress({ activity });
    expect(Object.keys(result.activity)).toHaveLength(120);
    expect(result.activity[daysAgoKey(129)]).toBeUndefined();
    expect(result.activity[daysAgoKey(0)]).toBe(1);
  });
});

describe("promoted", () => {
  it("starts a never-reviewed item at box 1 with a ~1 day due date", () => {
    const { box, due } = promoted(undefined);
    expect(box).toBe(1);
    expect(due).toBeGreaterThan(Date.now());
    expect(due).toBeLessThan(Date.now() + 2 * DAY_MS);
  });

  it("advances the box and pushes the due date further out", () => {
    const { box, due } = promoted({ box: 1, due: 0 });
    expect(box).toBe(2);
    expect(due).toBeGreaterThan(Date.now() + DAY_MS);
  });

  it("caps out at box 5", () => {
    expect(promoted({ box: 5, due: 0 }).box).toBe(5);
    expect(promoted({ box: 10, due: 0 }).box).toBe(5);
  });
});

describe("demoted", () => {
  it("always resets to box 1, due immediately", () => {
    const { box, due } = demoted();
    expect(box).toBe(1);
    expect(due).toBeLessThanOrEqual(Date.now());
  });
});

describe("bumped", () => {
  it("increments today's count", () => {
    const next = bumped({});
    expect(next[daysAgoKey(0)]).toBe(1);
    expect(bumped(next)[daysAgoKey(0)]).toBe(2);
  });

  it("prunes to the most recent 120 days once it grows past the cap", () => {
    const activity = {};
    for (let i = 1; i <= 120; i++) activity[daysAgoKey(i)] = 1;
    const next = bumped(activity);
    expect(Object.keys(next)).toHaveLength(120);
    expect(next[daysAgoKey(120)]).toBeUndefined();
    expect(next[daysAgoKey(0)]).toBe(1);
  });
});
