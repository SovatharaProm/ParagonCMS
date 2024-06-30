/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        "plus-jakarta": ['"Plus Jakarta Sans"', "sans-serif"],
      },
    },
  },
  variants: {},
  plugins: [require("tailwindcss"), require("autoprefixer")],
};
