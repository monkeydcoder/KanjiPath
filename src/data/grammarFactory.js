/**
 * Compact factory for grammar lessons so the data files stay readable.
 *
 * @param {string} id        Unique kebab-case slug.
 * @param {string} title     Lesson title, e.g. "は — Topic marker".
 * @param {string} jp        The grammar marker/form for big display, e.g. "は", "〜ています".
 * @param {1|2|3} priority   3 = essential (★★★), 2 = important (★★), 1 = useful (★).
 * @param {string} topic     A topic id from GRAMMAR_TOPICS.
 * @param {string} short     One-line "what it is".
 * @param {string} use       "When/why you use it".
 * @param {string} structure The pattern/structure, kept short.
 * @param {Array<[string,string,string]>} examples  [japanese, romaji, english].
 * @param {string} [note]    Optional common-mistake / beginner-trap note.
 */
export function G(id, title, jp, priority, topic, short, use, structure, examples, note = "") {
  return {
    id,
    title,
    jp,
    priority,
    topic,
    short,
    use,
    structure,
    examples: examples.map(([jpText, romaji, en]) => ({ jp: jpText, romaji, en })),
    note,
  };
}

// Topic registry — order is the learning/importance order used for filter chips.
// To add a topic later, add it here and tag lessons with its id.
export const GRAMMAR_TOPICS = [
  { id: "particles", label: "Particles", emoji: "🔤" },
  { id: "verbs", label: "Verb forms", emoji: "⚙️" },
  { id: "adjectives", label: "Adjectives", emoji: "🎨" },
  { id: "endings", label: "Sentence endings", emoji: "💬" },
  { id: "existence", label: "Existence", emoji: "📍" },
  { id: "time", label: "Time", emoji: "⏰" },
  { id: "requests", label: "Requests", emoji: "🙏" },
  { id: "ability", label: "Ability & permission", emoji: "✅" },
  { id: "necessity", label: "Necessity", emoji: "❗" },
  { id: "conditionals", label: "Conditionals", emoji: "🔀" },
  { id: "giving", label: "Giving & receiving", emoji: "🎁" },
  { id: "comparison", label: "Comparison", emoji: "⚖️" },
  { id: "expressions", label: "Expressions", emoji: "✨" },
];

export const TOPIC_BY_ID = Object.fromEntries(GRAMMAR_TOPICS.map((t) => [t.id, t]));

export const PRIORITY_LABELS = { 3: "Essential", 2: "Important", 1: "Useful" };
