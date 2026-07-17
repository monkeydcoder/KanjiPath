// Static class maps so Tailwind can see every class name at build time.
export const ACCENTS = {
  emerald: {
    solid: "bg-emerald-600",
    solidHover: "hover:bg-emerald-700",
    grad: "bg-gradient-to-r from-emerald-600 to-teal-500",
    gradHover: "hover:from-emerald-500 hover:to-teal-400",
    text: "text-emerald-700 dark:text-emerald-400",
    soft: "bg-emerald-50 dark:bg-emerald-950/40",
    softText: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-300 dark:border-emerald-800",
    ring: "ring-emerald-500",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
    stroke: "stroke-emerald-500",
  },
  indigo: {
    solid: "bg-indigo-600",
    solidHover: "hover:bg-indigo-700",
    grad: "bg-gradient-to-r from-indigo-600 to-violet-500",
    gradHover: "hover:from-indigo-500 hover:to-violet-400",
    text: "text-indigo-700 dark:text-indigo-400",
    soft: "bg-indigo-50 dark:bg-indigo-950/40",
    softText: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-300 dark:border-indigo-800",
    ring: "ring-indigo-500",
    bar: "bg-gradient-to-r from-indigo-500 to-violet-400",
    chip: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200",
    stroke: "stroke-indigo-500",
  },
};

const SELECTABLE_CARD_IDLE =
  "border-line text-stone-600 hover:border-stone-400 dark:border-night-line dark:text-stone-300 dark:hover:border-night-mute";

/**
 * Class string for the "bordered card" selection pattern shared by the Test
 * and Flashcards setup screens (mode/deck/count/direction pickers): an
 * accent-tinted border + ring when selected, a neutral border otherwise.
 */
export function selectableCardClass(accent, active) {
  return active
    ? `${accent.border} ${accent.soft} ${accent.softText} ring-1 ${accent.ring}`
    : SELECTABLE_CARD_IDLE;
}

export function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample(array, n) {
  return shuffle(array).slice(0, n);
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Local-timezone YYYY-MM-DD key, used for daily activity tracking. */
export function localDateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Consecutive study days ending today (or yesterday, so an unfinished
 * today doesn't zero the streak).
 */
export function computeStreak(activity) {
  const DAY = 86400000;
  let t = new Date();
  t.setHours(0, 0, 0, 0);
  if (!activity[localDateKey(t)]) t = new Date(t.getTime() - DAY);
  let streak = 0;
  while (activity[localDateKey(t)]) {
    streak++;
    t = new Date(t.getTime() - DAY);
  }
  return streak;
}
