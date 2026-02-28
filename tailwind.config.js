/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'rat-race': '#1a2e1a',
        'fast-track': '#1a1a2e',
        'payday': '#16a34a',
        'deal': '#2563eb',
        'doodad': '#dc2626',
        'market': '#d97706',
        'baby': '#ec4899',
        'charity': '#7c3aed',
        'downsize': '#64748b',
      },
      fontFamily: {
        game: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'dice-roll': 'diceRoll 0.6s ease-in-out',
        'card-flip': 'cardFlip 0.4s ease-in-out',
        'pawn-move': 'pawnMove 0.3s ease-in-out',
        'cash-up': 'cashUp 0.5s ease-out',
        'shake': 'shake 0.4s ease-in-out',
      },
      keyframes: {
        diceRoll: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(90deg) scale(1.2)' },
          '50%': { transform: 'rotate(180deg) scale(0.9)' },
          '75%': { transform: 'rotate(270deg) scale(1.1)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        cashUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-30px)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
}
