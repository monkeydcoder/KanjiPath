/**
 * Compact factory for kanji entries so the data files stay readable.
 *
 * @param {string} char    The kanji character.
 * @param {string} on      Onyomi readings in katakana, separated by "・" ("" if none).
 * @param {string} kun     Kunyomi readings in hiragana, separated by "・" ("" if none).
 * @param {string} meaning Beginner-friendly English meaning.
 * @param {number} strokes Stroke count.
 * @param {Array<[string,string,string]>} words  [written form, kana reading, English].
 * @param {Array<[string,string?]>} parts Sentence segments: [text] for kana,
 *                                        [text, reading] for kanji with furigana.
 * @param {string} en      English translation of the sentence.
 */
export function K(char, on, kun, meaning, strokes, words, parts, en) {
  return {
    char,
    on,
    kun,
    meaning,
    strokes,
    words: words.map(([w, r, m]) => ({ w, r, m })),
    sentence: { parts, en },
  };
}
