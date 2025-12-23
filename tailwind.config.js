/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
    "./*.{js,ts,jsx,tsx,vue}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#137fec",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "ticket-bg": "#fffdf5",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "mono": ["Roboto Mono", "monospace"],
      },
      boxShadow: {
        "ticket": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0,0,0,0.05)",
      }
    },
  },
  plugins: [],
}
