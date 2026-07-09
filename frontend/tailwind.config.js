/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1F2937',
        primary: '#D97706',
        income: '#16A34A',
        expense: '#B91C1C',
        purchase: '#EA580C',
        warning: '#FBBF24',
        cocoa: '#3F2A1D',
        cream: '#FFF7ED',
        sand: '#FEF3C7',
        copper: '#B45309',
        surface: '#FFFFFF',
        app: '#FFF7ED',
        text: '#1F2937',
        muted: '#78716C',
        border: '#FED7AA'
      },
      boxShadow: {
        soft: '0 12px 32px rgba(120, 53, 15, 0.12)'
      }
    }
  },
  plugins: []
};
