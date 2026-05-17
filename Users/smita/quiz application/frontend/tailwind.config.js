/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0f0f1a',
          card: '#16162a',
          elevated: '#1e1e38',
        },
        accent: {
          DEFAULT: '#7c3aed',
          glow: '#a78bfa',
          cyan: '#22d3ee',
        },
      },
      boxShadow: {
        glow: '0 0 30px rgba(124, 58, 237, 0.4)',
        'glow-cyan': '0 0 25px rgba(34, 211, 238, 0.35)',
        'score-pop': '0 0 40px rgba(34, 211, 238, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
