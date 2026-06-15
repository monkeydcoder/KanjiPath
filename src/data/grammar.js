import { N5_GRAMMAR } from "./grammar-n5";
import { N4_GRAMMAR } from "./grammar-n4";

export { GRAMMAR_TOPICS, TOPIC_BY_ID, PRIORITY_LABELS } from "./grammarFactory";

// One registry per level — to add a future level, add its array here.
export const GRAMMAR = {
  N5: N5_GRAMMAR,
  N4: N4_GRAMMAR,
};

export function grammarForLevel(level) {
  return GRAMMAR[level] ?? [];
}

export function grammarCountForLevel(level) {
  return grammarForLevel(level).length;
}
