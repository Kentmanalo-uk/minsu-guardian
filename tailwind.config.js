/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./modules/*/pages/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        minsu: {
          primary: '#059669',
          secondary: '#10b981',
          accent: '#34d399',
          dark: '#047857',
          light: '#d1fae5',
        }
      }
    },
  },
  plugins: [],
}
