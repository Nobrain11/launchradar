import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0a0b",
        card: "#121214",
        "card-hover": "#1a1a1e",
        border: "#27272a",
        "border-light": "#3f3f46",
        accent: "#22c55e",
        "accent-dim": "#16a34a",
        "accent-glow": "rgba(34, 197, 94, 0.15)",
        muted: "#71717a",
        foreground: "#fafafa",
        "foreground-muted": "#a1a1aa",
        danger: "#ef4444",
        warning: "#f59e0b",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(34, 197, 94, 0.15)",
        "glow-sm": "0 0 10px rgba(34, 197, 94, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
