/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pure black base
        'void': '#000000',
        'void-light': '#0a0a0a',

        // Neon accent colors
        'neon': {
          'cyan': '#00ffff',
          'green': '#00ff41',
          'pink': '#ff006e',
          'purple': '#b000ff',
          'blue': '#0080ff',
        },

        // Subtle grays
        'gray': {
          900: '#0a0a0a',
          800: '#141414',
          700: '#1a1a1a',
          600: '#2a2a2a',
          500: '#3a3a3a',
          400: '#666666',
          300: '#999999',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontWeight: {
        'thin': '100',
        'extralight': '200',
        'light': '300',
      },
      borderWidth: {
        '1': '1px',
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 255, 255, 0.5)',
        'neon-green': '0 0 10px rgba(0, 255, 65, 0.5)',
        'neon-pink': '0 0 10px rgba(255, 0, 110, 0.5)',
        'neon-purple': '0 0 10px rgba(176, 0, 255, 0.5)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
