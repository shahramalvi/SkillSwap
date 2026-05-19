/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f4f6fb",
        navy: "#0D1B3E",
        "navy-light": "#1a2f5e",
        "navy-dark": "#070f23",
        black: "#000000",
        teal: "#5b8def",
        "teal-dark": "#3d6fd6",
        "teal-light": "#e8edf7",
        gold: "#8eb4ff",
        "gold-light": "#eef3ff",
        rose: "#c45c5c",
        "rose-light": "#fdf0f0",
        purple: "#4a6fa5",
        "purple-light": "#e8edf7",
        surface: "#ffffff",
        surface2: "#f8f9fc",
        border: "#d0d8e8",
        muted: "#5c6b85",
        "karachi-gray": "#4a5a78",
        "on-hero": "#fafafa",
        "on-hero-muted": "#a8b8d4",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(135deg, #0D1B3E 0%, #000000 100%)",
        "teal-gradient": "linear-gradient(135deg, #5b8def 0%, #3d6fd6 100%)",
        "gold-gradient": "linear-gradient(135deg, #8eb4ff 0%, #5b8def 100%)",
        "purple-gradient": "linear-gradient(135deg, #4a6fa5 0%, #0D1B3E 100%)",
        "rose-gradient": "linear-gradient(135deg, #c45c5c 0%, #9e4545 100%)",
        "hero-gradient": "linear-gradient(135deg, #0D1B3E 0%, #0a1228 55%, #000000 100%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%)",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(13, 27, 62, 0.08)",
        card: "0 2px 8px rgba(13, 27, 62, 0.06)",
        colored: "0 8px 32px rgba(13, 27, 62, 0.18)",
        navy: "0 8px 32px rgba(13, 27, 62, 0.35)",
        glow: "0 0 0 3px rgba(13, 27, 62, 0.15)",
        "glow-gold": "0 0 0 3px rgba(142, 180, 255, 0.35)",
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        shimmer: "shimmer 1.5s infinite",
        "fade-up": "fadeUp 0.5s ease forwards",
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
