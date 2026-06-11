/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans JP", "system-ui", "sans-serif"],
        jp: ["Noto Sans JP", "sans-serif"],
      },
      colors: {
        paper: "#faf8f4",
        ink: "#2b2a33",
      },
      boxShadow: {
        card: "0 1px 3px rgba(43,42,51,0.06), 0 6px 20px rgba(43,42,51,0.06)",
      },
    },
  },
  plugins: [],
};
