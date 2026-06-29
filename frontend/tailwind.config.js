/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#12121a",
          tertiary: "#1a1a2e",
        },
        accent: {
          primary: "#e63946",
          secondary: "#ff6b6b",
        },
        success: "#06d6a0",
        warning: "#ffd166",
        danger: "#ef476f",
        text: {
          primary: "#f8f9fa",
          secondary: "#adb5bd",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        'accent-gradient': "linear-gradient(135deg, #e63946, #ff6b6b)",
        'dark-gradient': "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
