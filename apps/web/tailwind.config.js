/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d" },
        earth: { 50: "#faf8f5", 100: "#f0ebe3", 200: "#e0d5c5", 300: "#c9b89e", 400: "#b09a78", 500: "#9a8060", 600: "#8a6f52", 700: "#715a44", 800: "#5e4b3b", 900: "#4e3f33" },
      },
    },
  },
  plugins: [],
};
