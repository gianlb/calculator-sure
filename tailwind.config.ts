import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // SUREZONE Brand Colors
        surezone: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#1a4d2e",
        },
        // Cores da logo
        "logo-dark": "#1a4d2e",
        "logo-medium": "#2d6b42",
        "logo-light": "#3d7b52",
        "logo-bright": "#4ade80",
        "logo-neon": "#22ff88",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "logo-gradient": "linear-gradient(135deg, #1a4d2e 0%, #2d6b42 30%, #1a4d2e 70%, #0f3d1f 100%)",
        "logo-radial": "radial-gradient(ellipse at center, #2d6b42 0%, #1a4d2e 50%, #0f3d1f 100%)",
        "radar-gradient":
          "radial-gradient(circle at center, rgba(34, 255, 136, 0.15) 0%, rgba(45, 107, 66, 0.1) 50%, transparent 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(45, 107, 66, 0.2) 0%, rgba(26, 77, 46, 0.15) 100%)",
        "glow-gradient": "radial-gradient(circle at center, rgba(34, 255, 136, 0.2) 0%, transparent 70%)",
      },
      boxShadow: {
        premium: "0 20px 40px -12px rgba(34, 255, 136, 0.15)",
        glow: "0 0 15px rgba(34, 255, 136, 0.3)",
        "glow-lg": "0 0 25px rgba(34, 255, 136, 0.25)",
        "inner-glow": "inset 0 2px 4px 0 rgba(34, 255, 136, 0.1)",
        "logo-glow": "0 0 40px rgba(45, 107, 66, 0.3)",
        "radar-glow": "0 0 60px rgba(34, 255, 136, 0.25)",
        "detection-glow": "0 0 15px rgba(255, 68, 68, 0.4)",
      },
      // Apenas transições suaves mantidas
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      keyframes: {
        "clock-sweep": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        "detection-ping": {
          "0%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "scale(1.3)",
            opacity: "0.6",
          },
          "100%": {
            transform: "scale(1.8)",
            opacity: "0",
          },
        },
        "radar-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "0.6",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "0.3",
          },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(34, 255, 136, 0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(34, 255, 136, 0.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) translateZ(0)" },
          "50%": { transform: "translateY(-8px) translateZ(0)" },
        },
        "simple-spin": {
          "0%": { transform: "rotate(0deg) translateZ(0)" },
          "100%": { transform: "rotate(360deg) translateZ(0)" },
        },
      },
      animation: {
        "clock-sweep": "clock-sweep 6s linear infinite",
        "detection-ping": "detection-ping 3s ease-out infinite",
        "radar-pulse": "radar-pulse 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        float: "float 4s ease-in-out infinite",
        "simple-spin": "simple-spin 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
