import { Link } from "react-router-dom";

export default function EmptyState({ icon = "📚", title, message, ctaTo, ctaLabel }) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center">
      <div className="text-5xl">{icon}</div>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-stone-500">{message}</p>
      {ctaTo && (
        <Link
          to={ctaTo}
          className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
