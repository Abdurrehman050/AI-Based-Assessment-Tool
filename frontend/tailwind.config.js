/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f172a",    // dark navy
        accent: "#0ea5a4",     // teal-ish
        soft: "#f8fafc"
      }
    }
  },
  plugins: [],
}
