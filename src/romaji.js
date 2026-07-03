// Minimal Hepburn romaji → kana converter so beginners can search
// "mizu" and find 水（みず）without a Japanese keyboard.

const MAP = {
  kya: "きゃ", kyu: "きゅ", kyo: "きょ", gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",
  sha: "しゃ", shu: "しゅ", sho: "しょ", ja: "じゃ", ju: "じゅ", jo: "じょ",
  cha: "ちゃ", chu: "ちゅ", cho: "ちょ", nya: "にゃ", nyu: "にゅ", nyo: "にょ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ", bya: "びゃ", byu: "びゅ", byo: "びょ",
  pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ", mya: "みゃ", myu: "みゅ", myo: "みょ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",
  shi: "し", chi: "ち", tsu: "つ",
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  sa: "さ", su: "す", se: "せ", so: "そ",
  za: "ざ", ji: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  ta: "た", te: "て", to: "と", da: "だ", de: "で", do: "ど",
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  ha: "は", hi: "ひ", fu: "ふ", he: "へ", ho: "ほ",
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  ya: "や", yu: "ゆ", yo: "よ",
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  wa: "わ", wo: "を",
  a: "あ", i: "い", u: "う", e: "え", o: "お", n: "ん",
};

const CONSONANTS = "bcdfghjklmpqrstvwyz";

/** Returns "" when the input doesn't look like romaji. */
export function romajiToHiragana(input) {
  if (!/^[a-zA-Z\s'-]+$/.test(input)) return "";
  let s = input.toLowerCase().replace(/[\s']/g, "");
  let out = "";
  while (s.length) {
    // Doubled consonant → small っ (kitte → きって)
    if (s.length > 1 && s[0] === s[1] && CONSONANTS.includes(s[0]) && s[0] !== "n") {
      out += "っ";
      s = s.slice(1);
      continue;
    }
    let matched = false;
    for (const len of [3, 2, 1]) {
      const chunk = s.slice(0, len);
      if (MAP[chunk] && !(chunk === "n" && len === 1 && "aiueoy".includes(s[1] ?? ""))) {
        out += MAP[chunk];
        s = s.slice(len);
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (s[0] === "-") out += "ー";
      s = s.slice(1); // skip anything unconvertible
    }
  }
  return out;
}

export function hiraganaToKatakana(hira) {
  return hira.replace(/[ぁ-ゖ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

// ---- Kana → romaji (for showing romaji next to katakana readings) ----

// Inverse of MAP; digraphs (きゃ…) come first in MAP so they win.
const REVERSE = (() => {
  const r = {};
  for (const [ro, kana] of Object.entries(MAP)) {
    if (!(kana in r)) r[kana] = ro;
  }
  return r;
})();

export function kanaToRomaji(kana) {
  // Work in hiragana (converts katakana readings like コン too).
  const s = kana.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  let out = "";
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "っ") {
      // Double the next consonant: きって → kitte
      const next = REVERSE[s.slice(i + 1, i + 3)] ?? REVERSE[s[i + 1]] ?? "";
      out += next.charAt(0);
      i++;
      continue;
    }
    if (ch === "ー") {
      // Long-vowel mark: repeat the previous vowel
      out += /[aeiou]$/.exec(out)?.[0] ?? "";
      i++;
      continue;
    }
    const two = s.slice(i, i + 2);
    if (REVERSE[two]) { out += REVERSE[two]; i += 2; continue; }
    if (REVERSE[ch]) { out += REVERSE[ch]; i += 1; continue; }
    i++; // skip anything unconvertible
  }
  return out;
}

/** "ニチ・ジツ" → "nichi · jitsu" */
export function onyomiRomaji(on) {
  return on.split("・").map(kanaToRomaji).filter(Boolean).join(" · ");
}
