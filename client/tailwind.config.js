/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  darkMode: ["class", '[data-theme="midnight"]'],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },

      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },

        dark: {
          900: "#0B1020",
          800: "#11182B",
          700: "#182238",
          600: "#202C45",
        },

        accent: {
          purple: "#A855F7",
          pink: "#EC4899",
          cyan: "#06B6D4",
          green: "#10B981",
          orange: "#F97316",
          yellow: "#EAB308",
        },
      },

      backgroundImage: {
        "primary-gradient":
          "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)",

        "gaming-gradient":
          "linear-gradient(135deg, #0B1020 0%, #1E1B4B 50%, #312E81 100%)",

        "sunset-gradient":
          "linear-gradient(135deg, #F97316 0%, #EC4899 50%, #A855F7 100%)",

        "ocean-gradient":
          "linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)",
      },

      boxShadow: {
        glow: "0 0 25px rgba(99, 102, 241, 0.25)",
        "glow-purple": "0 0 25px rgba(168, 85, 247, 0.3)",
        "glow-cyan": "0 0 25px rgba(6, 182, 212, 0.3)",
        card: "0 8px 30px rgba(0, 0, 0, 0.2)",
      },

      animation: {
        float: "float 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },

        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },

        slideUp: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(99, 102, 241, 0.2)",
          },
          "50%": {
            boxShadow: "0 0 25px rgba(99, 102, 241, 0.5)",
          },
        },
      },

      borderRadius: {
        "4xl": "2rem",
      },

      transitionDuration: {
        400: "400ms",
        600: "600ms",
      },
    },
  },

  plugins: [],
};