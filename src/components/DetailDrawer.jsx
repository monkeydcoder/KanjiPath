import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Full-height slide-in panel for kanji details.
 *
 * Unlike a floating modal, this is always exactly as tall as the screen:
 * the title bar and footer stay pinned, and the content scrolls inside.
 * It can never open misaligned, at any window size or zoom level.
 */
export default function DetailDrawer({ title, onClose, onPrev, onNext, footer, children }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  // Portal into <body>: ancestor CSS transforms (e.g. page entrance
  // animations) would otherwise re-anchor position:fixed to the page
  // instead of the viewport and misalign the panel.
  return createPortal(
    <div className="fixed inset-0 z-40">
      <div
        className="fade-in absolute inset-0 bg-ink/45 backdrop-blur-sm dark:bg-black/65"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="slide-in-right absolute inset-y-0 right-0 flex w-full flex-col bg-card shadow-2xl dark:bg-night-card sm:max-w-lg sm:border-l sm:border-line dark:sm:border-night-line"
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 dark:border-night-line">
          <span className="section-label">{title}</span>
          <button
            onClick={onClose}
            className="rounded-full bg-stone-100 px-3.5 py-1.5 text-sm font-semibold text-stone-600 transition-all duration-200 hover:bg-stone-200 active:scale-95 dark:bg-night-soft dark:text-stone-300 dark:hover:bg-night-line"
          >
            ✕ Close
          </button>
        </header>

        <div className="nice-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <footer className="border-t border-line px-5 py-3.5 dark:border-night-line">
            {footer}
          </footer>
        )}
      </aside>
    </div>,
    document.body
  );
}
