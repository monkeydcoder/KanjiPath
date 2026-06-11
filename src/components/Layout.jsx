import { NavLink, Outlet } from "react-router-dom";
import { useStudy } from "../context/StudyContext";
import { LEVEL_IDS, LEVELS } from "../data";
import { ACCENTS } from "../utils";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5" },
  { to: "/learn", label: "Learn", icon: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5ZM8 7h8M8 11h6" },
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

function LevelToggle() {
  const { level, setLevel } = useStudy();
  return (
    <div className="flex rounded-full bg-stone-100 p-1 text-sm font-semibold">
      {LEVEL_IDS.map((id) => {
        const active = level === id;
        const accent = ACCENTS[LEVELS[id].accent];
        return (
          <button
            key={id}
            onClick={() => setLevel(id)}
            className={`rounded-full px-4 py-1.5 transition-colors ${
              active ? `${accent.solid} text-white shadow-sm` : "text-stone-500 hover:text-stone-800"
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
    <div className="min-h-screen pb-20 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink font-jp text-lg font-bold text-paper">
              漢
            </span>
            <span className="text-lg font-bold tracking-tight">
              Kanji<span className="text-emerald-600">Path</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
                  }`
                }
              >
                <Icon d={icon} className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <LevelToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  isActive ? "text-emerald-700" : "text-stone-500"
                }`
              }
            >
              <Icon d={icon} className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
