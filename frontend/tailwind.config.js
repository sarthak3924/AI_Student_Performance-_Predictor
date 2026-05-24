/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F8FAFC',
          dark: '#030712', // Deep slate/black
        },
        panel: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(17, 24, 39, 0.4)', // Transparent gray
        },
        brand: {
          purple: '#A855F7',
          blue: '#3B82F6',
          indigo: '#6366F1',
          neon: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-glow': '0 0 15px rgba(139, 92, 246, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
