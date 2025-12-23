/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: '#1938bc',
        secondary: '#5a8bea',
        background: '#f6f9f7',
        textBase: '#45484a',
        textAccent: '#373c8b',
        success: '#00AA06',
        error: '#e63946',
        deepBlue100: "#3A00B0",
        deepBlue300: "#29007D",
        deepBlue900: "#120037",
      },
      borderRadius: {
        xl2: '1rem',
      }
    },
  },
  plugins: [],
}