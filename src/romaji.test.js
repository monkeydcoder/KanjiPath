import { describe, expect, it } from "vitest";
import { hiraganaToKatakana, kanaToRomaji, onyomiRomaji, romajiToHiragana } from "./romaji";

describe("romajiToHiragana", () => {
  it("converts plain syllables", () => {
    expect(romajiToHiragana("mizu")).toBe("みず");
    expect(romajiToHiragana("konnichiwa")).toBe("こんにちわ");
  });

  it("converts digraphs (kya/sha/cha/...) before falling back to single kana", () => {
    expect(romajiToHiragana("kyoto")).toBe("きょと");
    expect(romajiToHiragana("sensha")).toBe("せんしゃ");
  });

  it("handles the shi/chi/tsu irregulars", () => {
    expect(romajiToHiragana("shi")).toBe("し");
    expect(romajiToHiragana("chi")).toBe("ち");
    expect(romajiToHiragana("tsu")).toBe("つ");
  });

  it("doubles the following consonant into a small っ", () => {
    expect(romajiToHiragana("kitte")).toBe("きって");
    expect(romajiToHiragana("gakkou")).toBe("がっこう");
  });

  it("does not sokuon-ize a doubled 'n' (that's just ん + a following n-row kana)", () => {
    expect(romajiToHiragana("konna")).toBe("こんな");
  });

  it("resolves the ambiguous 'n': part of a digraph when possible, else the moraic ん", () => {
    expect(romajiToHiragana("honya")).toBe("ほにゃ"); // "nya" digraph wins over "n" + "ya"
    expect(romajiToHiragana("hon")).toBe("ほん"); // trailing n -> ん
  });

  it("ignores spaces and apostrophes", () => {
    expect(romajiToHiragana("kon'ya")).toBe(romajiToHiragana("konya"));
    expect(romajiToHiragana("o ha yo")).toBe(romajiToHiragana("ohayo"));
  });

  it("returns an empty string for input that isn't romaji-shaped", () => {
    expect(romajiToHiragana("水")).toBe("");
    expect(romajiToHiragana("123")).toBe("");
    expect(romajiToHiragana("")).toBe("");
  });

  it("skips characters it can't map instead of throwing", () => {
    expect(() => romajiToHiragana("qqzzxx")).not.toThrow();
    expect(typeof romajiToHiragana("qqzzxx")).toBe("string");
  });
});

describe("hiraganaToKatakana", () => {
  it("shifts hiragana to its katakana codepoint", () => {
    expect(hiraganaToKatakana("みず")).toBe("ミズ");
  });

  it("leaves non-hiragana characters untouched", () => {
    expect(hiraganaToKatakana("abc123")).toBe("abc123");
  });
});

describe("kanaToRomaji", () => {
  it("converts simple hiragana", () => {
    expect(kanaToRomaji("みず")).toBe("mizu");
  });

  it("normalizes katakana to hiragana first, so both read the same", () => {
    expect(kanaToRomaji("コン")).toBe(kanaToRomaji("こん"));
    expect(kanaToRomaji("コン")).toBe("kon");
  });

  it("doubles the consonant for a small っ", () => {
    expect(kanaToRomaji("きって")).toBe("kitte");
  });

  it("repeats the preceding vowel for a long-vowel mark ー", () => {
    expect(kanaToRomaji("コーヒー")).toBe(kanaToRomaji("こおひい"));
  });
});

describe("onyomiRomaji", () => {
  it("joins multiple onyomi readings with a middle dot", () => {
    expect(onyomiRomaji("ニチ・ジツ")).toBe("nichi · jitsu");
  });

  it("returns an empty string for no onyomi", () => {
    expect(onyomiRomaji("")).toBe("");
  });
});
