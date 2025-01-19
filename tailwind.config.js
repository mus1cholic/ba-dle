/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '35vw': '35vw',
        '50vw': '50vw'
      },
      backgroundImage: {
        'custom-bg': "url('assets/ba-background.png')",
      }
    },
  },
  plugins: [],
};