import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        rajdhani: ["Rajdhani", "sans-serif"],
        mono: ["Share Tech Mono", "monospace"],
        exo: ["Exo 2", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // Ocean palette
        abyss: "#020810",
        deep: "#040f1f",
        ocean: "#061628",
        mid: "#0a2040",
        shallow: "#0e3060",
        cyan: {
          DEFAULT: "#00d4ff",
          dim: "#0099bb",
          glow: "rgba(0,212,255,0.3)",
        },
        biolum: {
          DEFAULT: "#00ffcc",
          dim: "#00bb99",
          glow: "rgba(0,255,204,0.25)",
        },
        coral: "#ff6b4a",
        amber: {
          DEFAULT: "#ffb347",
          dim: "#cc8822",
        },
        danger: "#ff3333",
        steel: "#8ab4c8",
        foam: "#c8e8f0",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-ocean": "linear-gradient(180deg, #040f1f 0%, #020810 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "bubble-rise": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.6" },
          "50%": { opacity: "0.9" },
          "100%": { transform: "translateY(-120px) scale(1.3)", opacity: "0" },
        },
        "sonar-ping": {
          "0%": { transform: "scale(0.5)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "pulse-cyan": {
          "0%, 100%": { boxShadow: "0 0 4px rgba(0,212,255,0.3)" },
          "50%": { boxShadow: "0 0 18px rgba(0,212,255,0.7), 0 0 36px rgba(0,212,255,0.3)" },
        },
        "pulse-danger": {
          "0%, 100%": { boxShadow: "0 0 4px rgba(255,51,51,0.3)" },
          "50%": { boxShadow: "0 0 18px rgba(255,51,51,0.8), 0 0 36px rgba(255,51,51,0.3)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "depth-flicker": {
          "0%, 95%, 100%": { opacity: "1" },
          "96%": { opacity: "0.7" },
          "98%": { opacity: "0.9" },
        },
        "type-in": {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease forwards",
        "fade-in-up": "fade-in-up 0.45s ease forwards",
        "scale-in": "scale-in 0.3s ease forwards",
        "bubble": "bubble-rise 3s ease-in infinite",
        "sonar": "sonar-ping 2s ease-out infinite",
        "pulse-cyan": "pulse-cyan 2s infinite",
        "pulse-danger": "pulse-danger 1.2s infinite",
        "float": "float 4s ease-in-out infinite",
        "depth-flicker": "depth-flicker 5s infinite",
        "blink": "blink 1s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
