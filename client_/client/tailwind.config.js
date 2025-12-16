/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          yellow: '#FCEE0A', // Cyberpunk Yellow
          red: '#FF003C',    // Danger Red
          blue: '#00F0FF',   // Neon Blue
          black: '#050505',  // Void Black
          dark: '#111111',   // Panel Background
          dim: 'rgba(252, 238, 10, 0.15)' 
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        }
      }
    },
  },
  plugins: [],
}