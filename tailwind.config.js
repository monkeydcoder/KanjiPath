/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans JP", "system-ui", "sans-serif"],
        display: ["Outfit", "Noto Sans JP", "system-ui", "sans-serif"],
        jp: ["Noto Sans JP", "sans-serif"],
        kanji: ["Noto Serif JP", "serif"],
      },
      colors: {
        paper: "#f6f1e8",
        card: "#fffdf8",
        ink: "#232032",
        line: "#e9e1d2",
        night: {
          DEFAULT: "#12131c",
          card: "#1a1c2a",
          soft: "#222438",
          line: "#2b2e45",
          mute: "#9398b4",
        },
        shu: {
          400: "#f0705a",
          500: "#e25a41",
          600: "#c94830",
          700: "#a93a26",
        },
      },
      boxShadow: {
        // Note: keys here must not collide with color names ("card" is a
        // color), or shadow-* resolves as a shadow-color utility instead.
        soft: "0 1px 2px rgba(35,32,50,0.05), 0 8px 24px -8px rgba(35,32,50,0.10)",
        lift: "0 2px 4px rgba(35,32,50,0.08), 0 16px 40px -12px rgba(35,32,50,0.22)",
        glow: "0 0 0 1px rgba(16,185,129,0.25), 0 8px 32px -8px rgba(16,185,129,0.35)",
      },
    },
  },
  plugins: [],
};
