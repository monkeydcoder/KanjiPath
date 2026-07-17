import { describe, expect, it } from "vitest";
import { ACCENTS, computeStreak, formatDate, localDateKey, sample, selectableCardClass, shuffle } from "./utils";

const DAY_MS = 86400000;

/** Builds an activity-map key for "n days before now", via the same
 *  localDateKey the app itself uses, so these tests stay correct regardless
 *  of what day they happen to run on. */
function daysAgoKey(n) {
  return localDateKey(new Date(Date.now() - n * DAY_MS));
}

describe("shuffle", () => {
  it("returns a permutation of the same elements without mutating the input", () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    const result = shuffle(original);
    expect(original).toEqual(copy);
    expect(result).toHaveLength(original.length);
    expect([...result].sort()).toEqual([...original].sort());
  });
});

describe("sample", () => {
  it("returns n elements drawn from the array", () => {
    const original = [1, 2, 3, 4, 5, 6];
    const result = sample(original, 3);
    expect(result).toHaveLength(3);
    for (const item of result) expect(original).toContain(item);
  });

  it("caps at the array length when n exceeds it", () => {
    expect(sample([1, 2, 3], 10)).toHaveLength(3);
  });
});

describe("localDateKey", () => {
  it("formats a date as local YYYY-MM-DD, zero-padded", () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(localDateKey(new Date(2026, 11, 31))).toBe("2026-12-31");
    expect(localDateKey(new Date(2026, 2, 3))).toBe("2026-03-03");
  });
});

describe("formatDate", () => {
  it("doesn't throw and produces a non-empty label", () => {
    expect(formatDate("2026-01-05T00:00:00.000Z").length).toBeGreaterThan(0);
  });
});

describe("computeStreak", () => {
  it("is 0 for no activity", () => {
    expect(computeStreak({})).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const activity = { [daysAgoKey(0)]: 1, [daysAgoKey(1)]: 1, [daysAgoKey(2)]: 1 };
    expect(computeStreak(activity)).toBe(3);
  });

  it("doesn't zero the streak if today is unfinished, as long as yesterday was studied", () => {
    const activity = { [daysAgoKey(1)]: 1, [daysAgoKey(2)]: 1 };
    expect(computeStreak(activity)).toBe(2);
  });

  it("stops at the first gap", () => {
    const activity = { [daysAgoKey(0)]: 1, [daysAgoKey(2)]: 1 }; // yesterday missing
    expect(computeStreak(activity)).toBe(1);
  });

  it("is 0 if neither today nor yesterday has activity", () => {
    const activity = { [daysAgoKey(3)]: 1 };
    expect(computeStreak(activity)).toBe(0);
  });
});

describe("selectableCardClass", () => {
  const accent = ACCENTS.emerald;

  it("uses the accent border/ring classes when active", () => {
    const cls = selectableCardClass(accent, true);
    expect(cls).toContain(accent.border);
    expect(cls).toContain(accent.ring);
  });

  it("uses a neutral idle class when inactive", () => {
    const cls = selectableCardClass(accent, false);
    expect(cls).not.toContain(accent.border);
    expect(cls).toContain("border-line");
  });
});
