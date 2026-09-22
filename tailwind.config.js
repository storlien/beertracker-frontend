/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        surface: "#1a1a1a",
        "surface-hover": "#252525",
        border: "#2a2a2a",
        primary: "#22c55e",
        "primary-hover": "#16a34a",
        danger: "#ef4444",
        "danger-hover": "#dc2626",
        text: "#e5e5e5",
        "text-muted": "#a3a3a3",
      },
    },
  },
  plugins: [],
};
