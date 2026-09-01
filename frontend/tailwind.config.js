
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canteen: {
          bg: '#F6F4EE',
          cream: '#FAF8F5',
          dark: '#1C1F1B',
          muted: '#6B726A',
          subtle: '#8C928B',
          border: '#E8E4DA',
          card: '#FFFFFF',
          green: {
            DEFAULT: '#2D5A43',
            dark: '#234735',
            hover: '#244b37',
            light: '#E8EFEA',
            border: '#D1E0D7',
          },
          badge: {
            bg: '#EAF0EB',
            text: '#2D5A43',
          }
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Instrument Serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
