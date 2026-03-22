# 🚦 Hệ thống Quản lý Sự cố Giao thông (TIMS)

> **Traffic Incident Management System** — Giải pháp quản lý sự cố giao thông thông minh, hỗ trợ báo cáo và điều phối cứu hộ thời gian thực, tối ưu hóa quy trình xử lý sự cố tại đô thị.

| Thông tin | Chi tiết |
|---|---|
| **Lớp** | CNTT4 - K64 |
| **Học phần** | Công nghệ phần mềm |
| **Trạng thái** | ✅ Hoàn thành Sprint 1 (Backend Core & Auth) |

---

## 👥 Thành viên nhóm

| Vai trò | Thành viên | Trách nhiệm |
|---|---|---|
| **Product Owner** | Nguyễn Văn A | Quản lý Product Backlog, ưu tiên tính năng, xác nhận kết quả Sprint |
| **Scrum Master** | Trần Thị B | Loại bỏ trở ngại, tổ chức ceremonies, đảm bảo quy trình Scrum |
| **Backend Developer** | Lê Văn C | Node.js, Express, Socket.IO, MongoDB, REST API |
| **Frontend Developer** | Phạm Thị D | React.js, Redux, Leaflet Maps, Responsive UI |
| **Full-stack Developer** | Hoàng Văn E | Node.js + React.js, tích hợp API, DevOps |

---

## 🏗️ 1. Kiến trúc hệ thống (System Architecture)

Dự án được xây dựng trên mô hình **Micro-monolith** với sự tách biệt rõ ràng giữa các tầng:

- **API Layer:** RESTful API chuẩn hóa với tiền tố `/api/v1`.
- **Security Layer:** JWT Bearer Token kết hợp phân quyền RBAC (Role-Based Access Control).
- **Storage Layer:** MongoDB với Geospatial Index (`2dsphere`) để xử lý bản đồ.
- **Real-time Layer:** Socket.IO phát tín hiệu sự cố tức thì.
- **DevOps:** Docker hóa toàn bộ ứng dụng và tự động hóa kiểm thử qua GitHub Actions.

---

## 📁 2. Cấu trúc dự án

```
backend/
├── src/
│   ├── config/          # Cấu hình Swagger (specs), Database connection
│   ├── controllers/     # Xử lý logic nghiệp vụ & Mapping dữ liệu
│   ├── jobs/            # Các task chạy ngầm (Cron jobs)
│   ├── middleware/      # Auth (Protect), Upload (Multer), Global Error Handler
│   ├── models/          # Mongoose Schemas (User, Incident)
│   ├── routes/          # Định tuyến API (Auth, Incidents)
│   ├── services/        # GeoService (Reverse Geocoding)
│   ├── tests/           # Integration Tests (Jest + Supertest)
│   └── utils/           # Constant codes (Error/Success), Response helpers
├── uploads/             # Thư mục lưu trữ ảnh sự cố vật lý
└── server.js            # Điểm khởi chạy (Entry Point)
```

---

## ⚙️ 3. Công nghệ sử dụng

| Công nghệ | Vai trò | Trạng thái |
|---|---|---|
| **Docker** | Đóng gói ứng dụng vào Container để chạy trên mọi môi trường | ✅ Đã cấu hình |
| **GitHub Actions** | Tự động chạy Test và Build mỗi khi Push code | ✅ Đã cấu hình |
| **Swagger UI** | Tài liệu API tương tác trực tiếp, hỗ trợ test Upload ảnh | ✅ Đã cấu hình |
| **Axios Interceptor** | Tự động xử lý Header Authorization (Bearer Token) | ✅ Đã cấu hình |
| **Socket.IO** | Phát tán sự cố thời gian thực đến các bên liên quan | ✅ Đã cấu hình |

---

## 🚀 4. Cài đặt & Vận hành nhanh

### Yêu cầu hệ thống

- Node.js v18+
- MongoDB v6.0+
- Docker & Docker Compose (Tùy chọn)

### Bước 1 — Chuẩn bị môi trường

Tạo file `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/incident_db
MONGO_URI_TEST=mongodb://localhost:27017/incident_test_db
JWT_SECRET=ma_bi_mat_cua_vy
```

### Bước 2 — Chạy với Docker (Khuyên dùng)

```bash
docker-compose up -d --build
```

### Bước 3 — Chạy thủ công để Development

```bash
npm install
npm run dev
```

---

## 🏆 5. Đặc điểm kỹ thuật nổi bật (Sprint 1)

### 🛡️ Xử lý lỗi & Phản hồi chuẩn hóa

Hệ thống sử dụng `AppError` và `globalExceptionHandler` đảm bảo mọi lỗi trả về Frontend đều có mã định danh riêng:

| Thành phần | Vai trò |
|---|---|
| **`AppError`** | Đóng gói lỗi thành chuẩn: mã nghiệp vụ (`1001`, `1002`...) + mã HTTP (`400`, `401`...) |
| **`Error.captureStackTrace`** | Dọn Stack Trace — chỉ thẳng vào Controller, loại bỏ code rác của framework |
| **`globalExceptionHandler(err, req, res, next)`** | Bắt buộc đủ 4 tham số để Express nhận diện đây là Error Middleware |

```js
// Controller chỉ cần ném lỗi — không cần xử lý
return next(new AppError(ErrorCodes.AUTH_USER_EXISTS));

// globalExceptionHandler lo phần còn lại
app.use((err, req, res, next) => { ... });
```

- **Success:** `{ success: true, result: [...] }`
- **Error:** `{ success: false, error: { code: XXX, message: "..." } }`

### 🔐 Bảo mật đa tầng

- Middleware kiểm tra trạng thái `isActive` — chặn ngay lập tức các tài khoản bị khóa dù có Token hợp lệ.
- **Dotenv** được nạp ở **dòng đầu tiên** của `server.js` — đảm bảo mọi biến môi trường sẵn sàng trước khi bất kỳ module nào khởi động.
- JWT ký với thuật toán **HS256** tường minh, thời hạn `1d`.

### 🗺️ Dịch vụ địa lý tự động (Geo-Automation)

`GeoService` tự động chuyển đổi tọa độ (Lat/Lon) thành địa chỉ văn bản qua OpenStreetMap API. MongoDB lưu trữ với Geospatial Index `2dsphere` hỗ trợ truy vấn bản đồ.

### ⚙️ Tự động hóa nghiệp vụ

- **Mongoose pre-save hook** sinh mã sự cố tự động theo định dạng `TYPE-YYYYMMDD-XXXX`.
- **Test Suite** kiểm tra toàn bộ luồng: Đăng ký → Đăng nhập → Tạo / Cập nhật / Xóa sự cố (bao gồm xóa file vật lý).

---

## 🧪 6. Kiểm thử & Chất lượng (Sprint 1 — Kết quả thực tế)

### Chạy test

```bash
cd backend
npm test -- --coverage
```

### Kết quả Unit Test

```
PASS  src/tests/app.test.js
  🚀 TIMS - KIỂM THỬ TÍCH HỢP TOÀN DIỆN (SPRINT 1)
    📁 Nhóm: Hạ tầng & Tài liệu
      √ Swagger UI: Truy cập được trang tài liệu API
      √ Error Handling: Trả về JSON chuẩn 404 khi sai URL
    🔐 Nhóm: Xác thực (US-15)
      √ Register: Đăng ký tài khoản thành công
      √ Login: Trả về Token khi đăng nhập đúng
    🚨 Nhóm: Quản lý sự cố (US-01)
      √ Create Incident: Tạo sự cố thành công (có đính kèm ảnh)
      √ Update Incident: Cập nhật thông tin sự cố thành công
      √ Delete Incident: Xóa sự cố & xóa ảnh vật lý thành công

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

### Kết quả Coverage

- **Test Suites:** 1 passed
- **Tests:** 7 passed (100% thành công)
- **Overall Coverage: > 80%** (Đạt mức tiêu chuẩn)

| Phân đoạn | % Statements | % Lines | Trạng thái |
|---|---|---|---|
| **Tổng thể (All files)** | 80.85% | 81.49% | ✅ Đạt chuẩn |
| Routes | 100% | 100% | 🚀 Tuyệt vời |
| Models | 92.85% | 100% | 🚀 Tuyệt vời |
| App Entry (app.js) | 100% | 100% | 🚀 Tuyệt vời |
| Controllers | 72.22% | 72.54% | 🟡 Cần cải thiện ở Sprint 2 |

### Tự động hóa CI/CD

- **Trạng thái:** ✅ Passing
- **Luồng chạy:** Mỗi khi push lên `main` → GitHub Actions khởi tạo Node 22 → `npm install` → Docker Build → Jest

---

## 🌿 7. Hướng dẫn đóng góp & làm việc nhóm (Git Workflow)

> Quy trình bắt buộc cho mọi thành viên — **không được commit thẳng lên `main`**.

### Bước 1 — Clone dự án về máy
```bash
git clone https://github.com/<your-org>/agile-scrum_traffic.git
cd agile-scrum_traffic
```

### Bước 2 — Tạo nhánh làm việc riêng

Đặt tên nhánh theo quy ước: `feature/<tên-tính-năng>` hoặc `fix/<tên-lỗi>`
```bash
git checkout main
git pull origin main
git checkout -b feature/ten-tinh-nang
```

### Bước 3 — Code & commit thường xuyên
```bash
git status
git add .
git commit -m "feat: mô tả ngắn gọn những gì vừa làm"
```

> **Gợi ý commit message:** `feat:` cho tính năng mới, `fix:` cho sửa lỗi, `refactor:` cho tái cấu trúc, `test:` cho viết test, `docs:` cho tài liệu.

### Bước 4 — Đồng bộ & Push
```bash
git fetch origin
git rebase origin/main
git push origin feature/ten-tinh-nang
```

### Bước 5 — Tạo Pull Request (PR)

1. Vào GitHub → chọn **"Compare & pull request"**
2. Mô tả rõ PR làm gì, fix lỗi nào
3. Assign ít nhất **1 người review**
4. Chờ approve → **Rebase and merge** vào `main`

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
| ❌ Không commit thẳng lên `main` | Mọi thay đổi phải qua PR |
| ✅ Rebase trước khi push | Tránh conflict khi merge |
| ✅ Mỗi PR chỉ làm 1 việc | Dễ review, dễ rollback nếu lỗi |
| ✅ Xóa nhánh sau khi merge | Giữ repo gọn gàng |

---

## 🔑 8. Tài liệu API (Swagger)

Sau khi khởi động Server, truy cập để xem và test đầy đủ các API — hỗ trợ Upload ảnh trực tiếp trên trình duyệt:

👉 `http://localhost:5000/api-docs`

---

<p align="center">Dự án được thực hiện bởi <strong>Lê Thanh Vy</strong> — 231220965 | CNTT4-K64 UTC</p>
