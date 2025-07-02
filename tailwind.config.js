/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'fade-in-out': 'fadeInOut 5s ease-in-out forwards',
        accordionDown: 'accordionDown 0.3s ease-out forwards',
        accordionUp: 'accordionUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeInOut: {
          '0%': { opacity: 0 },
          '10%': { opacity: 1 },
          '90%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        accordionDown: {
          '0%': { maxHeight: '0px', opacity: '0' },
          '100%': { maxHeight: '384px', opacity: '1' }, // max-h-96 = 384px
        },
        accordionUp: {
          '0%': { maxHeight: '384px', opacity: '1' },
          '100%': { maxHeight: '0px', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
