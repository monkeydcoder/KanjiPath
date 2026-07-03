/**
 * Pronounces Japanese text with the browser's built-in speech synthesis.
 * Renders nothing when the browser doesn't support it. Safe inside
 * clickable cards (stops propagation).
 *
 * Voice choice matters a lot for how natural this sounds, so instead of
 * taking the first Japanese voice we score all of them: network voices
 * (Chrome's "Google 日本語") and Enhanced/Premium local voices sound far
 * less robotic, and female voices (Kyoko, O-Ren, Nanami…) are preferred.
 */
const FEMALE_NAMES = ["kyoko", "o-ren", "nanami", "haruka", "sayaka", "kana", "female"];

let cachedVoice = null;

function pickJapaneseVoice() {
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ja"));
  if (voices.length === 0) return null;
  const score = (v) => {
    const name = v.name.toLowerCase();
    let s = 0;
    if (name.includes("google")) s += 8; // Chrome's network voice — most natural
    if (name.includes("enhanced") || name.includes("premium")) s += 6;
    if (name.includes("siri")) s += 4;
    if (FEMALE_NAMES.some((n) => name.includes(n))) s += 3;
    if (!v.localService) s += 1;
    return s;
  };
  return [...voices].sort((a, b) => score(b) - score(a))[0];
}

// Voices load asynchronously in some browsers — warm the list up and
// re-pick whenever it changes.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cachedVoice = pickJapaneseVoice();
  });
}

export default function SpeakButton({ text, className = "" }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const speak = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!cachedVoice) cachedVoice = pickJapaneseVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.95;
    utterance.pitch = 1.05; // slightly brighter, less monotone
    if (cachedVoice) utterance.voice = cachedVoice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`Listen: ${text}`}
      title="Listen"
      className={`inline-grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm transition-all duration-200 hover:bg-stone-200/70 active:scale-90 dark:hover:bg-night-soft ${className}`}
    >
      🔊
    </button>
  );
}
