/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        muted: '#667085',
        brand: {
          50: '#fff1f3',
          100: '#ffe4e8',
          500: '#c51636',
          600: '#a9112d',
          700: '#8d1029',
        },
        campus: {
          500: '#137c8b',
          600: '#0f6673',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(16, 24, 40, 0.10)',
        card: '0 10px 28px rgba(16, 24, 40, 0.08)',
      },
    },
  },
  plugins: [],
};
