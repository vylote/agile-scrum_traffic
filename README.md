# 🚦 Hệ thống Quản lý Sự cố Giao thông (TIMS)

> **Traffic Incident Management System** — Giải pháp hỗ trợ báo cáo và điều phối cứu hộ giao thông thời gian thực.

## 👥 Thành viên nhóm

| Vai trò | Thành viên | Trách nhiệm |
|---|---|---|
| **Product Owner** | Nguyễn Văn A | Quản lý Product Backlog, ưu tiên tính năng, xác nhận kết quả Sprint |
| **Scrum Master** | Trần Thị B | Loại bỏ trở ngại, tổ chức ceremonies, đảm bảo quy trình Scrum |
| **Backend Developer** | Lê Văn C | Node.js, Express, Socket.IO, MongoDB, REST API |
| **Frontend Developer** | Phạm Thị D | React.js, Redux, Leaflet Maps, Responsive UI |
| **Full-stack Developer** | Hoàng Văn E | Node.js + React.js, tích hợp API, DevOps |

---

## 🏗️ 1. Kiến trúc & Luồng hệ thống (System Flow)

Dự án áp dụng mô hình **Client-Server** với các lớp xử lý tách biệt:

- **Frontend:** React (Vite) + Redux Toolkit. Tích hợp Geolocation API để lấy tọa độ thực tế.
- **Backend:** Node.js + Express + MongoDB. Xử lý logic nghiệp vụ và dịch ngược tọa độ (Reverse Geocoding).
- **CI/CD:** Tự động hóa kiểm thử và đóng gói Docker thông qua GitHub Actions.

---

## 📁 2. Cấu trúc dự án

### Backend — `backend/src/`

```
backend/
├── src/
│   ├── config/         # Swagger, MongoDB, success/error codes
│   ├── controllers/    # Xử lý logic (Auth, Incident) - Có Swagger JSDoc
│   ├── middleware/     # Auth (JWT), Upload (Multer), Error Handler
│   ├── models/         # Mongoose Schemas (User, Incident)
│   ├── routes/         # Định nghĩa API endpoints (v1)
│   ├── services/       # GeoService (Dịch địa chỉ)
│   └── server.js       # Điểm khởi chạy hệ thống
├── Dockerfile          # Bản thiết kế đóng gói Container
└── .dockerignore       # Loại bỏ file thừa khi build Docker
```

### Frontend — `frontend/src/`

```
frontend/src/
├── hooks/              # useGeolocation (Tối ưu với useCallback)
├── services/           # api.js (Axios Interceptor tự động gắn Token)
├── store/              # Redux Toolkit quản lý Auth & Incident state
└── pages/              # Giao diện Báo cáo sự cố (ReportIncident)
```

---

## ⚙️ 3. Công nghệ mới bổ sung

| Công nghệ | Vai trò | Trạng thái |
|---|---|---|
| **Docker** | Đóng gói ứng dụng vào Container để chạy trên mọi môi trường | ✅ Đã cấu hình |
| **GitHub Actions** | Tự động chạy Test và Build mỗi khi Push code | ✅ Đã cấu hình |
| **Swagger UI** | Tài liệu API tương tác trực tiếp | ✅ Đã cấu hình |
| **Axios Interceptor** | Tự động xử lý Header Authorization (Bearer Token) | ✅ Đã cấu hình |

---

## 🚀 4. Cài đặt & Vận hành nhanh

### Bước 1 — Chuẩn bị môi trường

Tạo file `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/incident_db
JWT_SECRET=ma_bi_mat_cua_vy
```

### Bước 2 — Chạy với Docker (Khuyên dùng)

```bash
# Build và chạy toàn bộ hệ thống (DB + Backend)
docker-compose up -d
```

### Bước 3 — Chạy thủ công để Development

```bash
# Tại thư mục backend
npm install
npm run dev
```

---

## 🧪 5. Kiểm thử & Chất lượng (Sprint 1 — Kết quả thực tế)

### Chạy test

```bash
cd backend
npm test
```

### Kết quả Unit Test

```
FAIL  src/tests/app.test.js (7.261 s)
  Kiểm tra Hạ tầng và Kiến trúc (Sprint 1)
    √ Nên truy cập được tài liệu API Swagger tại /api-docs (37 ms)
    × Nên trả về lỗi validation thay vì 404 khi gọi Register thiếu body (5005 ms)
    × Nên yêu cầu xác thực khi truy cập danh sách sự cố (6 ms)

Test Suites: 1 failed, 1 total
Tests:       2 failed, 1 passed, 3 total
Time:        7.892 s
```

### Báo cáo Coverage

```
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   62.09 |     17.5 |   35.71 |   62.09 |
 src/app.js                 |  100.00 |   100.00 |  100.00 |  100.00 |
 src/controllers            |   37.03 |     0.00 |   25.00 |   37.03 |
  authController.js         |   42.85 |     0.00 |   50.00 |   42.85 |
  incidentController.js     |   30.76 |     0.00 |    0.00 |   30.76 |
 src/middleware             |   65.30 |    35.00 |   50.00 |   65.30 |
  auth.js                   |   50.00 |    30.00 |   66.66 |   50.00 |
  upload.js                 |   57.14 |     0.00 |    0.00 |   57.14 |
 src/models                 |  100.00 |   100.00 |  100.00 |  100.00 |
 src/routes                 |  100.00 |   100.00 |  100.00 |  100.00 |
 src/services/geoService.js |   37.50 |   100.00 |    0.00 |   37.50 |
 src/utils/response.js      |   50.00 |     0.00 |    0.00 |   50.00 |
----------------------------|---------|----------|---------|---------|
```

> ⚠️ **Coverage hiện tại: 62.09% Statements / 62.09% Lines** — chưa đạt mức tối thiểu **80%** theo yêu cầu dự án.

### Phân tích lỗi & hướng khắc phục

| Test case | Trạng thái | Nguyên nhân | Hướng xử lý |
|---|---|---|---|
| Swagger `/api-docs` | ✅ Pass | — | — |
| Register thiếu body | ❌ Timeout 5000ms | Server không phản hồi kịp — kết nối DB treo trong môi trường test | Dùng `jest.setTimeout()` hoặc mock MongoDB |
| Xác thực danh sách sự cố | ❌ Nhận `403` thay vì `401` | Middleware `protect` trả về 403 (Forbidden) khi thiếu token, cần trả 401 (Unauthorized) | Cập nhật status code trong middleware `auth.js` |

### Roadmap nâng Coverage lên ≥ 80%

| File ưu tiên | Coverage hiện tại | Việc cần làm |
|---|---|---|
| `incidentController.js` | 30.76% | Viết test cho tạo, cập nhật, xóa sự cố |
| `authController.js` | 42.85% | Bổ sung test login, token hết hạn |
| `geoService.js` | 37.50% | Mock API geocoding, test các trường hợp lỗi |
| `auth.js` (middleware) | 50.00% | Test token hợp lệ / sai / hết hạn |

### Tự động hóa CI/CD

- **Trạng thái:** ⚠️ Failing (do 2 test case thất bại)
- **Luồng chạy:** Mỗi khi push lên `main` → GitHub Actions khởi tạo Node 22 → `npm install` → Docker Build → Jest

---

## 🔑 6. Tài liệu API (Swagger)

Sau khi chạy Backend, truy cập đường dẫn sau để xem và test các API (Đăng ký, Đăng nhập, Báo cáo sự cố):

👉 `http://localhost:5000/api-docs`

---

<p align="center">Made with ❤️ by <strong>nhóm X</strong> — CNTT4 - K64</p>
