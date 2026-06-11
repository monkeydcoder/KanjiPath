// Static class maps so Tailwind can see every class name at build time.
export const ACCENTS = {
  emerald: {
    solid: "bg-emerald-600",
    solidHover: "hover:bg-emerald-700",
    soft: "bg-emerald-50",
    softText: "text-emerald-700",
    border: "border-emerald-200",
    ring: "ring-emerald-500",
    bar: "bg-emerald-500",
    chip: "bg-emerald-100 text-emerald-800",
  },
  indigo: {
    solid: "bg-indigo-600",
    solidHover: "hover:bg-indigo-700",
    soft: "bg-indigo-50",
    softText: "text-indigo-700",
    border: "border-indigo-200",
    ring: "ring-indigo-500",
    bar: "bg-indigo-500",
    chip: "bg-indigo-100 text-indigo-800",
  },
};

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
