/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        maroon: "#4B0F16",
        burgundy: "#7A2E36",
        gold: "#C89B63",
        ivory: "#E7DED7",
        cream: "#F5F1EC",
        cocoa: "#2A1A1C",
        bronze: "#A86F3D",
        beige: "#D8C2A8",
        "maroon-light": "#6B2A32",
        "gold-light": "#E4C799",
        "gold-dark": "#A67E45",
      },
      fontFamily: {
        sans: ["System"],
        display: ["System"],
      },
    },
  },
  plugins: [],
};
