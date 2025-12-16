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
          yellow: '#FCEE0A', // Vàng Arasaka (Màu chính)
          red: '#FF003C',    // Đỏ Samurai (Báo lỗi/Nguy hiểm)
          blue: '#00F0FF',   // Xanh Hologram (Thông tin)
          black: '#020202',  // Đen OLED (Nền)
          dark: '#131313',   // Nền các Card
          gray: '#2d2d2d',   // Màu phụ
          dim: 'rgba(252, 238, 10, 0.05)' // Lớp phủ mờ màu vàng
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      // Thêm hiệu ứng đổ bóng Neon
      boxShadow: {
        'neon-yellow': '0 0 10px rgba(252, 238, 10, 0.5), 0 0 20px rgba(252, 238, 10, 0.3)',
        'neon-blue': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-red': '0 0 10px rgba(255, 0, 60, 0.5), 0 0 20px rgba(255, 0, 60, 0.3)',
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
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