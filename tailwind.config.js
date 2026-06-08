/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Inter Variable"', 'Inter', 'sans-serif'] },
      colors: { navy: '#1e3a8a', gold: '#C5A059' },
    },
  },
  plugins: [],
}
