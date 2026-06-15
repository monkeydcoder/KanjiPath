import { NavLink, Outlet } from "react-router-dom";
import { useStudy } from "../context/StudyContext";
import { useTheme } from "../context/ThemeContext";
import { LEVEL_IDS, LEVELS } from "../data";
import { ACCENTS } from "../utils";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5" },
  { to: "/learn", label: "Learn", icon: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5ZM8 7h8M8 11h6" },
  { to: "/vocabulary", label: "Vocab", icon: "M4 4h10v13H4zM14 8h6v12h-6zM7 8h4M7 11h4M16.5 12h1" },
  { to: "/grammar", label: "Grammar", icon: "M4 5h16v10H9l-4 4V5z M8 9h8M8 12h5" },
  { to: "/revise", label: "Revise", icon: "M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" },
  { to: "/flashcards", label: "Cards", icon: "M7 7h13v13H7zM4 4h13v3H7a3 3 0 0 0-3 3v7H4z" },
  { to: "/test", label: "Test", icon: "M9 5h6M9 5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2M9 12l2 2 4-4" },
  { to: "/sentences", label: "Read", icon: "M4 6h16M4 10h16M4 14h10M4 18h7" },
];

function Icon({ d, className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-stone-200/70 text-stone-600 transition-all duration-200 hover:bg-stone-200 active:scale-90 dark:bg-night-soft dark:text-stone-300 dark:hover:bg-night-line"
    >
      {/* Sun */}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round"
        className="absolute inset-0 m-auto h-5 w-5 rotate-0 scale-100 text-amber-500 transition-all duration-300 dark:-rotate-90 dark:scale-0">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      {/* Moon */}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        className="absolute inset-0 m-auto h-5 w-5 rotate-90 scale-0 text-indigo-300 transition-all duration-300 dark:rotate-0 dark:scale-100">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    </button>
  );
}

function LevelToggle() {
  const { level, setLevel } = useStudy();
  return (
    <div className="flex rounded-full bg-stone-200/70 p-1 text-sm font-bold dark:bg-night-soft">
      {LEVEL_IDS.map((id) => {
        const active = level === id;
        const accent = ACCENTS[LEVELS[id].accent];
        return (
          <button
            key={id}
            onClick={() => setLevel(id)}
            className={`rounded-full px-4 py-1.5 transition-all duration-200 active:scale-95 ${
              active
                ? `${accent.grad} text-white shadow-sm`
                : "text-stone-500 hover:text-stone-800 dark:text-night-mute dark:hover:text-stone-200"
            }`}
            aria-pressed={active}
          >
            {id}
          </button>
        );
      })}
    </div>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/75 backdrop-blur-xl dark:border-night-line/70 dark:bg-night/75">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="group flex items-center gap-2.5">
            <span className="grid h-9 w-9 -rotate-3 place-items-center rounded-xl bg-gradient-to-br from-shu-400 to-shu-600 font-kanji text-lg font-bold text-white shadow-soft transition-transform duration-200 group-hover:rotate-0 group-active:scale-90">
              漢
            </span>
            <span className="hidden font-display text-lg font-bold tracking-tight sm:inline">
              Kanji<span className="text-shu-600 dark:text-shu-400">Path</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-ink text-white shadow-sm dark:bg-stone-100 dark:text-night"
                      : "text-stone-600 hover:bg-stone-200/60 dark:text-night-mute dark:hover:bg-night-soft"
                  }`
                }
              >
                <Icon d={icon} className="h-4 w-4" />
                <span className="hidden lg:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LevelToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/90 backdrop-blur-xl dark:border-night-line dark:bg-night/90 md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-0.5 pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[9px] font-semibold leading-none transition-colors duration-200 ${
                  isActive
                    ? "text-shu-600 dark:text-shu-400"
                    : "text-stone-500 dark:text-night-mute"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-7 w-11 place-items-center rounded-full transition-colors duration-200 ${
                      isActive ? "bg-shu-600/10 dark:bg-shu-400/15" : ""
                    }`}
                  >
                    <Icon d={icon} className="h-5 w-5" />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
