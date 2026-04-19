import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#20261f",
        leaf: "#2f6b4f",
        field: "#edf6e9",
        millet: "#f6c453",
        clay: "#c86f4a",
        paper: "#fffaf0"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(32, 38, 31, 0.10)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
