import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#09090B",
        "surface-0": "#0F0F12",
        "surface-2": "#18181B",
        accent: "#38BDF8",
        "text-0": "#FAFAFA",
        "text-1": "#D4D4D8",
        "text-2": "#A1A1AA",
        "text-3": "#71717A",
        severity: {
          critical: "#EF4444",
          high: "#F59E0B",
          medium: "#3B82F6",
          low: "#10B981",
          info: "#6B7280",
        },
      },
      fontFamily: {
        display: ["DM Sans", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
