import { PRIORITY_LABELS } from "../data/grammar";

/**
 * Reusable ★ priority marker. priority is 1–3.
 * Filled amber stars = importance; empty stars fill out to three.
 */
export default function PriorityStars({ priority, size = "text-sm", showLabel = false }) {
  const label = PRIORITY_LABELS[priority] ?? "";
  return (
    <span
      className="inline-flex items-center gap-1"
      title={`${label} — ${"★".repeat(priority)}`}
      aria-label={`Priority: ${label}`}
    >
      <span className={`inline-flex ${size} leading-none tracking-tight`}>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            aria-hidden
            className={n <= priority ? "text-amber-500" : "text-stone-300 dark:text-night-line"}
          >
            ★
          </span>
        ))}
      </span>
      {showLabel && (
        <span className="text-xs font-bold text-stone-500 dark:text-night-mute">{label}</span>
      )}
    </span>
  );
}
