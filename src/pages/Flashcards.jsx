import { useMemo, useState } from "react";
import { useStudy } from "../context/StudyContext";
import { ACCENTS, shuffle } from "../utils";
import EmptyState from "../components/EmptyState";

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
        <h1 className="text-2xl font-extrabold tracking-tight">Flashcards · {levelData.title}</h1>
        <p className="mt-1 text-sm text-stone-500">
          See the kanji, recall its reading and meaning, then flip the card to check.
          “Again” sends a card to the back of the deck until you know it.
        </p>
        <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Deck</h2>
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
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                    deckType === d.id
                      ? `${accent.border} ${accent.soft} ${accent.softText}`
                      : "border-stone-200 text-stone-600"
                  }`}
                >
                  {d.label}
                  <span className="block text-xs font-normal opacity-70">{size} cards</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={start}
            disabled={source.length === 0}
            className={`mt-6 w-full rounded-full py-3 font-semibold text-white disabled:opacity-40 ${accent.solid} ${accent.solidHover}`}
          >
            Start flashcards
          </button>
          {source.length === 0 && (
            <p className="mt-2 text-center text-xs text-stone-400">This deck is empty.</p>
          )}
        </div>
      </div>
    );
  }

  // ---- Finished ----
  if (deck.length === 0) {
    return (
      <div className="rise-in mx-auto max-w-md text-center">
        <div className="rounded-3xl border border-stone-200 bg-white p-10 shadow-card">
          <div className="text-5xl">🎴</div>
          <h1 className="mt-3 text-2xl font-extrabold">Deck complete!</h1>
          <p className="mt-1 text-stone-500">You got through all {doneCount} cards. よくできました！</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={start}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold text-white ${accent.solid} ${accent.solidHover}`}
            >
              Shuffle & restart
            </button>
            <button
              onClick={() => setDeck(null)}
              className="rounded-full bg-stone-100 px-6 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-200"
            >
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
      <div className="flex items-center justify-between text-sm font-medium text-stone-400">
        <button onClick={() => setDeck(null)} className="hover:text-stone-600">← Change deck</button>
        <span>
          {doneCount} done · {deck.length} to go
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full rounded-full transition-all ${accent.bar}`}
          style={{ width: `${(doneCount / total) * 100}%` }}
        />
      </div>

      <div className="flip-scene mt-6 cursor-pointer select-none" onClick={() => setFlipped((f) => !f)}>
        <div className={`flip-inner relative h-80 ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="flip-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white shadow-card">
            <span className="font-jp text-8xl font-bold">{card.char}</span>
            <span className="mt-6 text-xs font-medium uppercase tracking-wide text-stone-400">
              Tap to reveal
            </span>
          </div>
          {/* Back */}
          <div className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl border border-stone-200 bg-stone-900 px-6 text-center text-white shadow-card">
            <span className="font-jp text-4xl font-bold">{card.char}</span>
            <span className="text-xl font-bold capitalize">{card.meaning}</span>
            <div className="mt-1 text-sm text-stone-300">
              <p>
                音 <span className="font-jp">{card.on || "—"}</span>
              </p>
              <p>
                訓 <span className="font-jp">{card.kun || "—"}</span>
              </p>
            </div>
            <p className="mt-1 font-jp text-sm text-stone-400">
              {card.words[0].w}（{card.words[0].r}）= {card.words[0].m}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => answer(false)}
          className="rounded-full bg-rose-100 py-3 font-semibold text-rose-700 transition-colors hover:bg-rose-200"
        >
          Again ↻
        </button>
        <button
          onClick={() => answer(true)}
          className="rounded-full bg-emerald-100 py-3 font-semibold text-emerald-700 transition-colors hover:bg-emerald-200"
        >
          Got it ✓
        </button>
      </div>
    </div>
  );
}
