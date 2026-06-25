/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#0B2D4D",
          900: "#1F2933",
          800: "#005B96",
          700: "#0077B6",
          600: "#00A6C8",
          500: "#009688",
          400: "#C9A227"
        },
        surface: {
          50: "#FAFCFE",
          100: "#F1F5F9",
          200: "#D9E2EC"
        },
        success: "#16803C",
        warning: "#D97706",
        danger: "#B91C1C",
        body: "#4B5563",
        muted: "#6B7280"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(11, 45, 77, 0.08)"
      }
    }
  },
  plugins: []
};

