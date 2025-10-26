// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // CRITICAL: This line tells Tailwind to scan all your JS/React files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}