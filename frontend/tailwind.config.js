/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f172a",
        accent: "#0ea5a4",
        soft: "#f8fafc"
      },
      boxShadow: {
        // Primary shadows (optional)
        "primary-big": "0 40px 80px rgba(15,23,42,0.25)",
        "primary-big-hover": "0 60px 120px rgba(15,23,42,0.35)",

        // ✅ Accent-colored shadows
        "accent-glow": "0 20px 60px rgba(14,165,164,0.25)",
        "accent-glow-hover": "0 40px 120px rgba(14,165,164,0.45)"
      }
    }
  },
  plugins: [],
}
