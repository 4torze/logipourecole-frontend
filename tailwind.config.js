/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Alignés sur les tokens du design system "Modernist" (styles.scss).
        primary: {
          DEFAULT: "#f2610a",
          hover: "#d14e00",
          light: "#fff3e6",
          dark: "#742c00",
        },
        "bg-light": "#f3f2f2",
        "bg-dark": "#201e1d",
        surface: "#eae9e9",
        "surface-dim": "#eae7e7",
        border: "#d7d3d3",
        "border-variant": "#bab6b6",
        text: {
          DEFAULT: "#201e1d",
          secondary: "#605d5d",
          tertiary: "#7d7979",
        },
        success: { DEFAULT: "#1a7a3f", bg: "#e3f5e9" },
        warning: { DEFAULT: "#e0791f", bg: "#fff5ea" },
        danger: { DEFAULT: "#a33d00", bg: "#fff3e6" },
        info: { DEFAULT: "#f2610a", bg: "#fff3e6" },
      },
      fontFamily: {
        display: ["Archivo", "sans-serif"],
        body: ["Archivo", "system-ui", "sans-serif"],
      },
      // Modernist est un système à angles francs — pas d'arrondi.
      borderRadius: {
        DEFAULT: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px color-mix(in srgb, #2d2b2b 14%, transparent)",
        "card-hover": "0 3px 10px color-mix(in srgb, #2d2b2b 16%, transparent)",
        modal: "0 12px 32px color-mix(in srgb, #2d2b2b 22%, transparent)",
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

