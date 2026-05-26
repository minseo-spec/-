/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
        mint: 'rgb(var(--color-mint) / <alpha-value>)',
        peach: 'rgb(var(--color-peach) / <alpha-value>)',
        sky: 'rgb(var(--color-sky) / <alpha-value>)',
        lavender: 'rgb(var(--color-lavender) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(71, 85, 105, 0.12)',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
