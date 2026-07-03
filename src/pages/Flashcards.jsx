import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStudy } from "../context/StudyContext";
import { vocabPoolForLevel } from "../data/vocab";
import { ACCENTS, shuffle } from "../utils";
import SpeakButton from "../components/SpeakButton";

const DIRECTIONS = [
  { id: "jp-en", label: "日 → EN", desc: "see Japanese, recall the meaning" },
  { id: "en-jp", label: "EN → 日", desc: "see the meaning, recall the Japanese" },
];

const DECK_IDS = ["due", "k-all", "k-learned", "k-todo", "v-all"];

export default function Flashcards() {
  const { level, levelData, learnedSet, srs, reviewItem } = useStudy();
  const accent = ACCENTS[levelData.accent];
  const [searchParams] = useSearchParams();

  const [deckId, setDeckId] = useState("k-all");
  const [direction, setDirection] = useState("jp-en");
  const [deck, setDeck] = useState(null); // null = setup screen
  const [flipped, setFlipped] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  // Allow deep-linking a deck, e.g. the dashboard's "reviews due" card.
  useEffect(() => {
    const d = searchParams.get("deck");
    if (d && DECK_IDS.includes(d)) setDeckId(d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decks = useMemo(() => {
    const kanjiCards = levelData.kanji.map((k) => ({ kind: "kanji", id: "k:" + k.char, ...k }));
    const vocabCards = vocabPoolForLevel(level).map((w) => ({ kind: "vocab", id: "v:" + w.jp, ...w }));
    const now = Date.now();
    const due = [...kanjiCards, ...vocabCards]
      .filter((c) => srs[c.id] && srs[c.id].due <= now)
      .sort((a, b) => srs[a.id].due - srs[b.id].due);
    return [
      { id: "due", label: "🔥 Due review", items: due, hint: "spaced repetition" },
      { id: "k-all", label: "All kanji", items: kanjiCards },
      { id: "k-learned", label: "Learned kanji", items: kanjiCards.filter((c) => learnedSet.has(c.char)) },
      { id: "k-todo", label: "Kanji to learn", items: kanjiCards.filter((c) => !learnedSet.has(c.char)) },
      { id: "v-all", label: "All vocabulary", items: vocabCards },
    ];
  }, [levelData, level, srs, learnedSet]);

  const selected = decks.find((d) => d.id === deckId) ?? decks[1];

  const start = () => {
    // The due deck reviews most-overdue first; other decks shuffle.
    setDeck(deckId === "due" ? [...selected.items] : shuffle(selected.items));
    setFlipped(false);
    setDoneCount(0);
  };

  const answer = (gotIt) => {
    const card = deck[0];
    reviewItem(card.id, gotIt); // updates the SRS box + due date, counts activity
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
          Recall the answer, then flip to check. “Got it” moves a card up the
          review ladder (1 → 16 days); “Again” brings it back today.
        </p>
        <div className="card mt-6 p-6">
          <h2 className="section-label">Deck</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {decks.map((d) => (
              <button
                key={d.id}
                onClick={() => setDeckId(d.id)}
                className={`rounded-2xl border px-3 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                  deckId === d.id
                    ? `${accent.border} ${accent.soft} ${accent.softText} ring-1 ${accent.ring}`
                    : "border-line text-stone-600 hover:border-stone-400 dark:border-night-line dark:text-stone-300 dark:hover:border-night-mute"
                }`}
              >
                {d.label}
                <span className="block text-xs font-normal opacity-70 [font-variant-numeric:tabular-nums]">
                  {d.items.length} cards{d.hint ? ` · ${d.hint}` : ""}
                </span>
              </button>
            ))}
          </div>

          <h2 className="section-label mt-6">Direction</h2>
          <div className="mt-2 flex gap-2">
            {DIRECTIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDirection(d.id)}
                className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
                  direction === d.id
                    ? `${accent.border} ${accent.soft} ${accent.softText} ring-1 ${accent.ring}`
                    : "border-line text-stone-600 hover:border-stone-400 dark:border-night-line dark:text-stone-300 dark:hover:border-night-mute"
                }`}
              >
                {d.label}
                <span className="block text-xs font-normal opacity-70">{d.desc}</span>
              </button>
            ))}
          </div>

          <button
            onClick={start}
            disabled={selected.items.length === 0}
            className={`btn-grad mt-6 w-full py-3 ${accent.grad} ${accent.gradHover}`}
          >
            Start flashcards
          </button>
          {selected.items.length === 0 && (
            <p className="mt-2 text-center text-xs text-stone-400 dark:text-night-mute">
              {deckId === "due"
                ? "Nothing due right now — nice! Answers in tests and flashcards feed this deck."
                : "This deck is empty."}
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
            {deckId === "due" && " Come back tomorrow for the next reviews."}
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
  const front =
    direction === "jp-en"
      ? card.kind === "kanji"
        ? { text: card.char, cls: "font-kanji text-9xl font-bold" }
        : { text: card.jp, cls: "px-6 text-center font-jp text-6xl font-bold leading-tight" }
      : {
          text: card.kind === "kanji" ? card.meaning : card.en,
          cls: "px-8 text-center font-display text-3xl font-bold capitalize leading-snug",
        };

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
              {card.kind === "kanji" ? levelData.id : `${levelData.id} · ${card.emoji}`}
            </span>
            <span className={front.cls}>{front.text}</span>
            <span className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-stone-400 dark:text-night-mute">
              Tap to reveal
            </span>
          </div>
          {/* Back */}
          <div className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl border border-stone-700 bg-gradient-to-br from-stone-800 to-stone-950 px-6 text-center text-white shadow-lift dark:border-stone-300 dark:from-stone-100 dark:to-stone-300 dark:text-night">
            {card.kind === "kanji" ? (
              <>
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
                <p className="flex items-center gap-1 font-jp text-sm text-stone-400 dark:text-stone-500">
                  {card.words[0].w}（{card.words[0].r}）= {card.words[0].m}
                  <SpeakButton text={card.words[0].r} className="text-stone-400" />
                </p>
              </>
            ) : (
              <>
                <span className="font-jp text-4xl font-bold">{card.jp}</span>
                {card.r !== card.jp && (
                  <span className="font-jp text-lg text-stone-300 dark:text-stone-600">{card.r}</span>
                )}
                <span className="font-display text-xl font-bold">{card.en}</span>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-400 dark:text-stone-500">
                  {card.emoji} {card.topic}
                  <SpeakButton text={card.r} className="text-stone-400" />
                </p>
              </>
            )}
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
