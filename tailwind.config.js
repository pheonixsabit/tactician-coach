/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts,js}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        tft: {
          bg: "#0B0E14",
          card: "#151922",
          cardHover: "#1E2430",
          border: "#2A3241",
          gold: "#F5C344",
          tier1: "#8C92AC",
          tier2: "#199757",
          tier3: "#207AC7",
          tier4: "#C440A1",
          tier5: "#EAA638",
          rankS: "#6366F1",
          rankA: "#10B981",
          rankB: "#3B82F6",
          rankC: "#F59E0B",
          rankD: "#EF4444"
        }
      }
    },
  },
  plugins: [],
}
