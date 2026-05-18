/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pace: {
          bg: '#F4F4F8',
          card: '#FFFFFF',
          text: '#1A1A2E',
          secondary: '#6B7280',
          muted: '#B0B7C3',
          border: '#EBEBF0',
          green: '#7DC9A0',
          'green-light': '#E8F7F0',
          purple: '#9B8ECD',
          'purple-light': '#EEECFB',
          amber: '#F5C06B',
          'amber-light': '#FEF4DF',
          rose: '#F2A0AE',
          'rose-light': '#FEEFF2',
          blue: '#7BAFD4',
          'blue-light': '#EAF3FB',
          orange: '#F0976A',
          'orange-light': '#FEF0E7',
          nav: '#E8F7F0',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        phone: '0 32px 80px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}
