/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', dark: '#1D4ED8', light: '#DBEAFE' },
        route: {
          fast: '#2563EB',
          green: '#10B981',
          reliable: '#F59E0B',
          accessible: '#8B5CF6',
        },
        success: '#22C55E',
        warning: '#EAB308',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
