# 1. Chọn môi trường chạy: Node.js bản 22 nhẹ (alpine)
FROM node:22-alpine

# 2. Tạo thư mục chứa app trong "chiếc hộp" Docker
WORKDIR /app

# 3. Copy file quản lý thư viện vào trước
COPY package*.json ./

# 4. Cài đặt các thư viện cần thiết
RUN npm install

# 5. Copy toàn bộ code từ máy Vy vào trong Docker
COPY . .

# 6. Mở cổng 5000 (để thế giới bên ngoài có thể gọi API của Vy)
EXPOSE 5000

# 7. Lệnh khởi chạy server khi Docker bắt đầu chạy
CMD ["node", "src/server.js"]