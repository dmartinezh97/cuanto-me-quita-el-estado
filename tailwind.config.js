/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  /**
   * Safelist for dynamically generated color classes.
   *
   * Why: Category icons use dynamic colors like `bg-${cat.color}-100`.
   * Tailwind's JIT compiler can't detect these at build time, so we
   * explicitly include them to prevent purging.
   */
  safelist: [
    // Light mode backgrounds and text
    { pattern: /^bg-(blue|orange|yellow|pink|purple|emerald|gray)-(100|900)/ },
    { pattern: /^text-(blue|orange|yellow|pink|purple|emerald|gray)-(400|600)/ },
    // Dark mode backgrounds (explicit strings since patterns don't work with dark:)
    'dark:bg-blue-900/30', 'dark:bg-orange-900/30', 'dark:bg-yellow-900/30',
    'dark:bg-pink-900/30', 'dark:bg-purple-900/30', 'dark:bg-emerald-900/30', 'dark:bg-gray-900/30',
    'dark:text-blue-400', 'dark:text-orange-400', 'dark:text-yellow-400',
    'dark:text-pink-400', 'dark:text-purple-400', 'dark:text-emerald-400', 'dark:text-gray-400',
  ],
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
