/**
 * Renders a Japanese sentence from segments, with optional furigana and
 * optional highlighting of a target kanji.
 *
 * parts: Array of [text] or [text, reading].
 */
export default function Furigana({ parts, showFurigana = true, highlight }) {
  return (
    <span className="font-jp leading-loose">
      {parts.map(([text, reading], i) => {
        const isTarget = highlight && text.includes(highlight);
        const cls = isTarget ? "font-bold text-emerald-700" : undefined;
        if (reading && showFurigana) {
          return (
            <ruby key={i} className={cls}>
              {text}
              <rt>{reading}</rt>
            </ruby>
          );
        }
        return (
          <span key={i} className={cls}>
            {text}
          </span>
        );
      })}
    </span>
  );
}
