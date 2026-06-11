import { N5 } from "./n5";
import { N4_PART1 } from "./n4-part1";
import { N4_PART2 } from "./n4-part2";
import { N4_PART3 } from "./n4-part3";

const N4 = [...N4_PART1, ...N4_PART2, ...N4_PART3];

// To add a new JLPT level later (e.g. N3), create its data file and add an
// entry here — every page derives its content from this object.
export const LEVELS = {
  N5: {
    id: "N5",
    title: "JLPT N5",
    subtitle: "The foundation — 80 essential kanji",
    kanji: N5,
    accent: "emerald",
  },
  N4: {
    id: "N4",
    title: "JLPT N4",
    subtitle: "The next step — 167 everyday kanji",
    kanji: N4,
    accent: "indigo",
  },
};

export const LEVEL_IDS = Object.keys(LEVELS);

export const byChar = Object.fromEntries(
  LEVEL_IDS.flatMap((id) =>
    LEVELS[id].kanji.map((k) => [k.char, { ...k, level: id }])
  )
);
