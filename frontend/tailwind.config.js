/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['"Poppins"', 'sans-serif'],
    },
    extend: {
      colors: {
        municipal: {
          dark: '#0f3a38', // Deep Forest Teal
          blue: '#14b8a6', // Eco Teal Main (replaces old navy blue across the app seamlessly)
          light: '#5eead4', // Cyber Cyan
          green: '#10b981', // Vivid smart green
          greenDark: '#059669',
          accent: '#facc15', // Gold accent
          bg: '#f0fdfa' // extremely light teal
        }
      },
      boxShadow: {
        '3d-light': '10px 10px 20px #cdd6e0, -10px -10px 20px #ffffff',
        '3d-dark': '10px 10px 20px #0a162a, -10px -10px 20px #12284e',
        '3d-card': '5px 5px 15px rgba(0, 0, 0, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.8)',
        '3d-card-hover': '8px 8px 20px rgba(0, 0, 0, 0.15), -8px -8px 20px rgba(255, 255, 255, 0.9)',
        'inner-3d': 'inset 5px 5px 10px #cdd6e0, inset -5px -5px 10px #ffffff',
      }
    },
  },
  plugins: [],
}
