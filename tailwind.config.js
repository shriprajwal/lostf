/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3d87ff',
          light: '#60a5fa',
          dark: '#0a0c10',
          card: 'rgba(22, 27, 40, 0.75)'
        }
      }
    },
  },
  plugins: [],
}
