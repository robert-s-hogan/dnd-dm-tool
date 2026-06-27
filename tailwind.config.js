/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        olive: {
          700: '#4a5e2a',
          800: '#3a4b20',
          900: '#2a3a15',
        },
      },
    },
  },
  plugins: [],
}

