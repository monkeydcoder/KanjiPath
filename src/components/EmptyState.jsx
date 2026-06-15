import { Link } from "react-router-dom";

export default function EmptyState({ icon = "📚", title, message, ctaTo, ctaLabel }) {
  return (
    <div className="mx-auto max-w-md rounded-[2rem] border border-dashed border-stone-300 bg-card/70 px-6 py-14 text-center dark:border-night-line dark:bg-night-card/60">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-gradient-to-br from-emerald-100 to-amber-100 text-4xl shadow-soft dark:from-emerald-950/60 dark:to-indigo-950/60">
        {icon}
      </div>
      <h2 className="mt-5 font-display text-lg font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-500 dark:text-night-mute">
        {message}
      </p>
      {ctaTo && (
        <Link to={ctaTo} className="btn-ink mt-6 px-6 py-2.5">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
