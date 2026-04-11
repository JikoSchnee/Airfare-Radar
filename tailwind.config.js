import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08111f',
        panel: '#0f1b33',
        accent: '#f97316',
        skyline: '#38bdf8',
      },
      boxShadow: {
        ticket: '0 22px 65px rgba(8, 17, 31, 0.28)',
      },
      backgroundImage: {
        aurora:
          'radial-gradient(circle at top left, rgba(56, 189, 248, 0.22), transparent 34%), radial-gradient(circle at top right, rgba(249, 115, 22, 0.18), transparent 32%), linear-gradient(180deg, rgba(8, 17, 31, 0.96), rgba(8, 17, 31, 1))',
      },
    },
  },
  plugins: [forms],
};
