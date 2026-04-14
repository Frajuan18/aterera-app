import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This overrides the default 'sans' stack with Poppins
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        // Reverb-specific neutral tones
        neutral: {
          400: "#A1A1A1", // The gray color for nav links
          800: "#2A2A2A", // Logo box top
          950: "#0A0A0A", // Logo box bottom
        }
      },
    },
  },
  plugins: [],
};

export default config;