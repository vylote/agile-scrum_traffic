module.exports = {
  // Môi trường kiểm thử cho Node.js
  testEnvironment: 'node',
  
  // Tự động thu thập độ bao phủ [cite: 1023]
  collectCoverage: true,
  
  //Chỉ định nơi lấy mã nguồn để tính % coverage
  collectCoverageFrom: [
    'src/**/*.js',            // Lấy tất cả file trong src
    '!src/tests/**',          // Loại trừ thư mục test
    '!src/config/**',         // Loại trừ cấu hình
    '!src/server.js'          // Loại trừ file khởi chạy vì không chứa logic
  ],
  
  // Thư mục xuất báo cáo
  coverageDirectory: 'coverage',
  
  // Các loại định dạng báo cáo
  coverageReporters: ['text', 'lcov'],
};