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
          yellow: '#FCEE0A', // Cyberpunk Yellow (Màu chính)
          red: '#FF003C',    // Danger Red (Lỗi/Tấn công)
          blue: '#00F0FF',   // Hologram Blue (Thông tin)
          black: '#050505',  // Void Black (Nền sâu)
          dark: '#111111',   // Panel Background
          dim: 'rgba(252, 238, 10, 0.15)' // Màu nền mờ
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'], // Font tiêu đề
        mono: ['Share Tech Mono', 'monospace'], // Font thông số
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #2a2a2a 1px, transparent 1px), linear-gradient(to bottom, #2a2a2a 1px, transparent 1px)",
        'dots-pattern': "radial-gradient(#333 1px, transparent 1px)",
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' },
        },
        scan: {
          '0%': { backgroundPosition: '0 -100vh' },
          '100%': { backgroundPosition: '0 100vh' }
        }
      }
    },
  },
  plugins: [],
}