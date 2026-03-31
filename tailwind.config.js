/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'afd-blue': '#009EE0',
        'afd-red': '#E3000F',
        'afd-dark': '#003366'
      }
    },
  },
  plugins: [],
}
