/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Modern teal/turquoise theme colors (matching image)
        vscode: {
          bg: "#0a0e27",
          bgAlt: "#151937",
          bgDark: "#1a1f3a",
          border: "#2a2f4a",
          text: "#e4e6eb",
          textMuted: "#a0a3bd",
          textDark: "#6b6e8f",
          blue: "#1e90ff",
          green: "#10b981",
          yellow: "#fbbf24",
          red: "#ef4444",
          purple: "#a78bfa",
          cyan: "#00d9c0",
          teal: "#00d9c0",
        },
        // Theme CSS variable colors
        theme: {
          bg: "var(--theme-bg)",
          "bg-alt": "var(--theme-bg-alt)",
          "bg-dark": "var(--theme-bg-dark)",
          border: "var(--theme-border)",
          text: "var(--theme-text)",
          "text-muted": "var(--theme-text-muted)",
          "text-dark": "var(--theme-text-dark)",
        },
        // Teal accent color scale
        teal: {
          50: "#e6fffe",
          100: "#b3fffc",
          200: "#80fff9",
          300: "#4dfff7",
          400: "#1afff4",
          500: "#00d9c0", // Primary teal
          600: "#00b39d",
          700: "#008d7a",
          800: "#006757",
          900: "#004134",
        },
      },
    },
  },
  plugins: [],
};
