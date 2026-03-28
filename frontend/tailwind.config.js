/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind quét tất cả file jsx để tạo CSS
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Màu chủ đạo lấy từ Figma của bạn
        primary: '#E8472A',      // Đỏ cam — màu nút chính
        'primary-dark': '#C0392B', // Đỏ đậm hơn khi hover
        navy: '#1A3A5C',         // Xanh navy — header
        'gray-bg': '#F5F7FA',    // Xám nhạt — nền trang
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}