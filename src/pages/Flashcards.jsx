import { useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { ACCENTS, shuffle } from "../utils";

const DECKS = [
  { id: "all", label: "All kanji" },
  { id: "learned", label: "Learned" },
  { id: "todo", label: "Not learned yet" },
];

export default function Flashcards() {
  const { levelData, learnedSet } = useStudy();
  const accent = ACCENTS[levelData.accent];

  const [deckType, setDeckType] = useState("all");
  const [deck, setDeck] = useState(null); // null = setup screen
  const [flipped, setFlipped] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const source = useMemo(() => {
    if (deckType === "learned") return levelData.kanji.filter((k) => learnedSet.has(k.char));
    if (deckType === "todo") return levelData.kanji.filter((k) => !learnedSet.has(k.char));
    return levelData.kanji;
  }, [deckType, levelData, learnedSet]);

  const start = () => {
    setDeck(shuffle(source));
    setFlipped(false);
    setDoneCount(0);
  };

  const answer = (gotIt) => {
    setFlipped(false);
    // Brief delay so the card flips back before the next one appears.
    setTimeout(() => {
      setDeck((d) => {
        const [first, ...rest] = d;
        return gotIt ? rest : [...rest, first];
      });
      if (gotIt) setDoneCount((n) => n + 1);
    }, 220);
  };

  // ---- Setup ----
  if (deck === null) {
    return (
      <div className="rise-in mx-auto max-w-lg">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Flashcards <span className={accent.text}>· {levelData.title}</span>
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-night-mute">
          See the kanji, recall its reading and meaning, then flip the card to check.
          “Again” sends a card to the back of the deck until you know it.
        </p>
        <div className="card mt-6 p-6">
          <h2 className="section-label">Deck</h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {DECKS.map((d) => {
              const size =
                d.id === "all"
                  ? levelData.kanji.length
                  : d.id === "learned"
                    ? levelData.kanji.filter((k) => learnedSet.has(k.char)).length
                    : levelData.kanji.filter((k) => !learnedSet.has(k.char)).length;
              return (
                <button
                  key={d.id}
                  onClick={() => setDeckType(d.id)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                    deckType === d.id
                      ? `${accent.border} ${accent.soft} ${accent.softText} ring-1 ${accent.ring}`
                      : "border-line text-stone-600 hover:border-stone-400 dark:border-night-line dark:text-stone-300 dark:hover:border-night-mute"
                  }`}
                >
                  {d.label}
                  <span className="block text-xs font-normal opacity-70 [font-variant-numeric:tabular-nums]">
                    {size} cards
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={start}
            disabled={source.length === 0}
            className={`btn-grad mt-6 w-full py-3 ${accent.grad} ${accent.gradHover}`}
          >
            Start flashcards
          </button>
          {source.length === 0 && (
            <p className="mt-2 text-center text-xs text-stone-400 dark:text-night-mute">
              This deck is empty.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ---- Finished ----
  if (deck.length === 0) {
    return (
      <div className="rise-in mx-auto max-w-md text-center">
        <div className="card p-10">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] bg-gradient-to-br from-emerald-100 to-amber-100 text-4xl shadow-soft dark:from-emerald-950/60 dark:to-indigo-950/60">
            🎴
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Deck complete!</h1>
          <p className="mt-1 text-stone-500 dark:text-night-mute">
            You got through all {doneCount} cards. よくできました！
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={start}
              className={`btn-grad px-6 py-2.5 ${accent.grad} ${accent.gradHover}`}
            >
              Shuffle & restart
            </button>
            <button onClick={() => setDeck(null)} className="btn-soft px-6 py-2.5">
              Change deck
            </button>
          </div>
        </div>
      </div>
    );
  }

  const card = deck[0];
  const total = doneCount + deck.length;

  return (
    <div className="rise-in mx-auto max-w-md">
      <div className="flex items-center justify-between text-sm font-semibold text-stone-400 [font-variant-numeric:tabular-nums] dark:text-night-mute">
        <button
          onClick={() => setDeck(null)}
          className="rounded-full px-2 py-1 transition-colors duration-200 hover:text-stone-600 dark:hover:text-stone-300"
        >
          ← Change deck
        </button>
        <span>
          {doneCount} done · {deck.length} to go
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200/80 dark:bg-night-soft">
        <div
          className={`h-full rounded-full transition-all duration-500 ${accent.bar}`}
          style={{ width: `${(doneCount / total) * 100}%` }}
        />
      </div>

      <div className="flip-scene mt-6 cursor-pointer select-none" onClick={() => setFlipped((f) => !f)}>
        <div className={`flip-inner relative h-80 ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="flip-face card absolute inset-0 flex flex-col items-center justify-center transition-shadow duration-200 hover:shadow-lift">
            <span className={`absolute left-4 top-4 rounded-full px-2.5 py-0.5 text-xs font-bold ${accent.chip}`}>
              {levelData.id}
            </span>
            <span className="font-kanji text-9xl font-bold">{card.char}</span>
            <span className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-stone-400 dark:text-night-mute">
              Tap to reveal
            </span>
          </div>
          {/* Back */}
          <div className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl border border-stone-700 bg-gradient-to-br from-stone-800 to-stone-950 px-6 text-center text-white shadow-lift dark:border-stone-300 dark:from-stone-100 dark:to-stone-300 dark:text-night">
            <span className="font-kanji text-4xl font-bold">{card.char}</span>
            <span className="font-display text-xl font-bold capitalize">{card.meaning}</span>
            <div className="mt-1 text-sm text-stone-300 dark:text-stone-600">
              <p>
                音 <span className="font-jp">{card.on || "—"}</span>
              </p>
              <p>
                訓 <span className="font-jp">{card.kun || "—"}</span>
              </p>
            </div>
            <p className="mt-1 font-jp text-sm text-stone-400 dark:text-stone-500">
              {card.words[0].w}（{card.words[0].r}）= {card.words[0].m}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => answer(false)}
          className="rounded-full bg-rose-100 py-3.5 font-bold text-rose-700 shadow-soft transition-all duration-200 hover:bg-rose-200 hover:shadow-lift active:scale-[0.96] dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/70"
        >
          Again ↻
        </button>
        <button
          onClick={() => answer(true)}
          className="rounded-full bg-emerald-100 py-3.5 font-bold text-emerald-700 shadow-soft transition-all duration-200 hover:bg-emerald-200 hover:shadow-lift active:scale-[0.96] dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/70"
        >
          Got it ✓
        </button>
      </div>
    </div>
  );
}
