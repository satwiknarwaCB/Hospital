/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9', // Sky blue - Reassuring
          600: '#0284c7',
          700: '#0369a1', // Medical Blue
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#38bdf8', // Sky Blue Accent
          600: '#0ea5e9',
          700: '#0284c7',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
