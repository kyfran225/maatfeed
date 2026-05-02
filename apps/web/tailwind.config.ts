import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#e9dcc2",
        ember: "#d46a36",
        ink: "#16120f",
        gold: "#c5a24c",
        stone: "#64594f"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["'Trebuchet MS'", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
