/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#f98006",
          hover: "#e07305",
          light: "#fde8d0",
          dark: "#c96606",
        },
        "bg-light": "#f8f7f5",
        "bg-dark": "#1a1614",
        surface: "#ffffff",
        "surface-dim": "#f5f0ec",
        border: "#e7e5e4",
        "border-variant": "#d6d3d1",
        text: {
          DEFAULT: "#1c1917",
          secondary: "#78716c",
          tertiary: "#a8a29e",
        },
        success: { DEFAULT: "#10b981", bg: "#d1fae5" },
        warning: { DEFAULT: "#f59e0b", bg: "#fef3c7" },
        danger: { DEFAULT: "#ef4444", bg: "#fee2e2" },
        info: { DEFAULT: "#f98006", bg: "#ffedd5" },
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        modal: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "zoom-in": "zoomIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        zoomIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}

