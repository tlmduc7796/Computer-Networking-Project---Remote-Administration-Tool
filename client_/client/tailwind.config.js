// client/tailwind.config.js
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
          yellow: '#FCEE0A', // Màu vàng đặc trưng
          blue: '#00F0FF',   // Xanh neon
          red: '#FF003C',    // Đỏ lỗi
          black: '#020202',  // Đen sâu
          gray: '#1a1a1a',   // Xám nền card
          dim: 'rgba(252, 238, 10, 0.1)' // Vàng mờ làm nền nhẹ
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'], // Cho tiêu đề
        mono: ['Share Tech Mono', 'monospace'], // Cho data
      },
      boxShadow: {
        'cyber': '4px 4px 0px 0px #FCEE0A', // Đổ bóng cứng màu vàng
        'cyber-blue': '4px 4px 0px 0px #00F0FF',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}