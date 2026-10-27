/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0b1329',
          dark: '#070d1e',
          teal: '#00a8b5',
          'teal-hover': '#00909c',
          cyan: '#06b6d4',
          orange: '#f97316',
          coral: '#ff5722',
          magenta: '#e11d48'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
};
