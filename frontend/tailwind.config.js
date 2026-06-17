/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        ink: '#1E1E1E',
        mist: '#F5F5F5',
      },
      boxShadow: {
        card: '0 18px 35px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
