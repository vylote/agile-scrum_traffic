# Hệ thống Quản lý Sự cố Giao thông (TIMS)

> **Traffic Incident Management System** — Giải pháp quản lý sự cố giao thông thông minh. Hệ thống cung cấp nền tảng báo cáo sự cố, điều phối đội cứu hộ tự động (Auto-Dispatch), giám sát bản đồ nhiệt thời gian thực (Real-time Heatmap), và trích xuất báo cáo chuyên nghiệp.

---

## 1. Kiến trúc hệ thống (System Architecture)

Dự án được xây dựng trên mô hình **Client-Server** với sự phân tách rõ ràng, chịu tải cao và hỗ trợ thời gian thực:

- **Frontend Layer:** React.js kết hợp Tailwind CSS, quản lý state bằng Redux, vẽ biểu đồ qua Recharts và bản đồ Leaflet.
- **API Layer:** Node.js & Express cung cấp RESTful API chuẩn hóa với tiền tố `/api/v1`, bảo mật bằng JWT (RBAC).
- **Database Layer:** MongoDB với Geospatial Index (`2dsphere`) để truy vấn tọa độ không gian.
- **Background Jobs Layer:** Redis & Bull Queue xử lý hàng đợi điều phối xe tự động và thử lại (retry) khi thất bại.
- **Real-time Layer:** Socket.IO xử lý luồng dữ liệu hai chiều, cập nhật Dashboard và định vị xe cứu hộ tức thì.
- **DevOps:** Docker hóa toàn bộ ứng dụng và tự động hóa kiểm thử qua GitHub Actions.

---

## 2. Công nghệ sử dụng

| Lớp | Công nghệ & Thư viện | Vai trò |
|---|---|---|
| **Frontend** | React.js, Tailwind CSS, Recharts, Leaflet | Xây dựng UI/UX, Bản đồ nhiệt, Biểu đồ thống kê |
| **Backend** | Node.js, Express.js | Xử lý logic nghiệp vụ, REST API |
| **Database** | MongoDB, Mongoose | Lưu trữ dữ liệu, truy vấn không gian (Geospatial) |
| **Real-time & Job** | Socket.IO, Redis, Bull | Truyền phát dữ liệu tức thì, quản lý hàng đợi điều phối |
| **Tiện ích** | ExcelJS, node-cron, Joi | Xuất báo cáo Excel, lập lịch dọn dẹp hệ thống, kiểm tra dữ liệu |
| **DevOps** | Docker, Docker Compose, GitHub Actions | Đóng gói môi trường, tự động hóa CI/CD |

---

## 3. Cài đặt & Vận hành

### Yêu cầu hệ thống

- Node.js v20+
- MongoDB v6.0+ — yêu cầu chạy ở chế độ **Replica Set `rs0`** để hỗ trợ Database Transaction
- Docker & Docker Compose (khuyên dùng để chạy đồng bộ MongoDB và Redis)

### Bước 1 — Thiết lập biến môi trường

Tạo file `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/incident_db?replicaSet=rs0&directConnection=true
MONGO_URI_TEST=mongodb://localhost:27017/incident_test_db
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
GOOGLE_APPLICATION_CREDENTIALS="./config/firebase-service-account.json"
```

### Bước 2 — Khởi chạy Database & Cache (khuyên dùng)

Chạy lệnh sau tại thư mục gốc để khởi động MongoDB (với Replica Set) và Redis:

```bash
docker-compose up -d --build
```

### Bước 3 — Khởi chạy Server và Client

**Backend:**

```bash
cd backend
npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## 4. Hướng dẫn đóng góp & làm việc nhóm (Git Workflow)

> Quy trình bắt buộc cho mọi thành viên — **không được commit thẳng lên `main`**.

### Bước 1 — Clone dự án về máy

```bash
git clone https://github.com/<your-org>/agile-scrum_traffic.git
cd agile-scrum_traffic
```

### Bước 2 — Tạo nhánh làm việc riêng

Đặt tên nhánh theo quy ước: `feature/<tên-tính-năng>` hoặc `fix/<tên-lỗi>`

```bash
# Luôn tạo nhánh mới từ main mới nhất
git checkout main
git pull origin main

# Tạo và chuyển sang nhánh mới
git checkout -b feature/ten-tinh-nang
# Ví dụ:
# git checkout -b feature/dashboard-realtime
# git checkout -b fix/auth-401-status
```

### Bước 3 — Code & commit thường xuyên

```bash
git status
git add .
git commit -m "feat: mô tả ngắn gọn những gì vừa làm"
```

> **Gợi ý commit message:** `feat:` tính năng mới · `fix:` sửa lỗi · `refactor:` tái cấu trúc · `test:` viết test · `docs:` tài liệu

### Bước 4 — Đồng bộ với `main` trước khi push (Rebase)

Trong lúc bạn làm việc, teammate có thể đã push thêm code mới lên `main`. Cần cập nhật nhánh của mình trước khi merge:

```bash
# Vẫn đứng ở nhánh feature — không cần checkout sang main
git fetch origin main     # tải code mới nhất từ GitHub vào kho tạm origin/main
git rebase origin/main    # "dời" commit của bạn lên sau commit mới nhất của team
```

Nếu có conflict, Git sẽ dừng lại và báo file nào bị xung đột:

```bash
# Mở file conflict, sửa tay phần được đánh dấu, rồi:
git add .
git rebase --continue

# Nếu muốn huỷ, quay về trạng thái trước khi rebase:
git rebase --abort
```

> **Tại sao dùng `rebase` thay vì `merge`?** `merge` tạo thêm một commit thừa làm lịch sử ngoằn ngoèo. `rebase` dời commit của bạn lên sau commit mới nhất của team, giữ lịch sử thẳng hàng và dễ đọc hơn.

### Bước 5 — Push nhánh lên GitHub

```bash
git push origin feature/ten-tinh-nang
```

### Bước 6 — Tạo Pull Request (PR)

1. Vào GitHub → chọn **"Compare & pull request"**
2. Mô tả rõ PR này làm gì, fix lỗi nào, hoặc thêm tính năng gì
3. Assign ít nhất **1 người review**
4. Chờ approve → **Rebase and merge** vào `main`
5. Xóa nhánh sau khi merge để giữ repo gọn gàng

### Sơ đồ luồng Git

```
main ──────────────────────────────────────► (production)
  │                                ▲
  │  git checkout -b feature/xyz   │ Pull Request & Merge
  ▼                                │
feature/xyz ── commit ── commit ───┘
```

### Quy tắc chung

| Quy tắc | Chi tiết |
|---|---|
| Không commit thẳng lên `main` | Mọi thay đổi phải qua PR |
| Rebase trước khi push | Tránh conflict khi merge |
| Mỗi PR chỉ làm 1 việc | Dễ review, dễ rollback nếu lỗi |
| Xóa nhánh sau khi merge | Giữ repo gọn gàng |

---

## 5. Tài liệu API (Swagger)

Sau khi khởi động Server, truy cập để xem và test đầy đủ các API — hỗ trợ Upload ảnh và test JWT trực tiếp trên trình duyệt:

`http://localhost:5000/api-docs`

- Hỗ trợ Authorize bằng JWT Bearer Token.
- Định nghĩa đầy đủ Schemas, Parameters và cấu trúc Response.

> **Lưu ý khi test API Update:** Field `photos` dùng để upload file binary mới. Field `keepPhotos` dùng để dán **tên** các file cũ (lấy từ DB) muốn giữ lại.

---

<p align="center">Made with ❤️ by <strong>Lê Thanh Vy</strong> — 231220965 | CNTT4-K64</p>