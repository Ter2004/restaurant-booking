import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#e8c97e",
          dim: "#c9a84c",
          light: "#f5e4b3",
        },
        surface: "#111111",
        elevated: "#1a1a1a",
        overlay: "#222222",
        base: "#0a0a0a",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        soft: "0 4px 24px rgba(0,0,0,0.4)",
        glow: "0 0 40px rgba(232,201,126,0.15)",
        "glow-sm": "0 0 20px rgba(232,201,126,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
