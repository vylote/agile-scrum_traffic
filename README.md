# 🚦 Hệ thống Quản lý Sự cố Giao thông (TIMS)

> **Traffic Incident Management System** — Giải pháp hỗ trợ báo cáo và điều phối cứu hộ giao thông thời gian thực, tập trung vào tính chính xác của dữ liệu và tốc độ phản hồi.

| Thông tin | Chi tiết |
|---|---|
| **Lớp** | CNTT4 - K64 |
| **Học phần** | Phát triển phần mềm hướng dịch vụ |
| **Quy trình** | Agile/Scrum (Hoàn thành Sprint 1) |

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

## 🏗️ 1. Kiến trúc & Luồng hệ thống (System Architecture)

Dự án áp dụng kiến trúc **Client-Server** hiện đại với sự tách biệt rõ rệt giữa các tầng xử lý:

- **Frontend:** React (Vite) + Redux Toolkit. Tích hợp Geolocation API để xác định vị trí sự cố chính xác.
- **Backend:** Node.js + Express + MongoDB. Xử lý logic nghiệp vụ theo mô hình **Controller-Service-Model**.
- **Real-time:** Socket.IO đảm bảo thông tin sự cố được phát tán tức thời đến các bên liên quan.
- **DevOps:** Docker hóa toàn bộ ứng dụng và tự động hóa kiểm thử qua GitHub Actions.

---

## 📁 2. Cấu trúc dự án

### Backend — `backend/src/`

```
backend/
├── src/
│   ├── config/          # Cấu hình Swagger, MongoDB, Database
│   ├── controllers/     # Điều hướng logic & Swagger JSDoc
│   ├── middleware/      # Auth (JWT), Upload (Multer), Error Handler
│   ├── models/          # Mongoose Schemas (User, Incident)
│   ├── routes/          # Định nghĩa API endpoints (v1)
│   ├── services/        # GeoService (Reverse Geocoding) & Business Logic
│   ├── utils/           # Helper functions & Constant Codes
│   └── server.js        # Điểm khởi chạy hệ thống (Entry Point)
└── uploads/             # Lưu trữ ảnh sự cố vật lý
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

## ⚙️ 3. Công nghệ sử dụng

| Công nghệ | Vai trò | Trạng thái |
|---|---|---|
| **Docker** | Đóng gói ứng dụng vào Container để chạy trên mọi môi trường | ✅ Đã cấu hình |
| **GitHub Actions** | Tự động chạy Test và Build mỗi khi Push code | ✅ Đã cấu hình |
| **Swagger UI** | Tài liệu API tương tác trực tiếp | ✅ Đã cấu hình |
| **Axios Interceptor** | Tự động xử lý Header Authorization (Bearer Token) | ✅ Đã cấu hình |
| **Socket.IO** | Phát tán sự cố thời gian thực đến các bên liên quan | ✅ Đã cấu hình |

---

## 🚀 4. Cài đặt & Vận hành nhanh

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
# Build và chạy toàn bộ hệ thống (DB + Backend)
docker-compose up -d --build
```

### Bước 3 — Chạy thủ công để Development

```bash
# Tại thư mục backend
npm install
npm run dev
```

---

## 🏆 5. Đặc điểm kỹ thuật nổi bật (Sprint 1)

### 🛡️ Xử lý lỗi & Phản hồi chuẩn hóa (Error Handling Pipeline)

Hệ thống sử dụng lớp `AppError` tùy chỉnh kết hợp với `globalExceptionHandler`. Mọi phản hồi API đều tuân thủ cấu trúc thống nhất:

| Thành phần | Vai trò |
|---|---|
| **`AppError`** | Đóng gói lỗi thành chuẩn: mã nghiệp vụ (`1001`, `1002`...) + mã HTTP (`400`, `401`...) |
| **`Error.captureStackTrace`** | Dọn Stack Trace — chỉ thẳng vào Controller, loại bỏ code rác của framework |
| **`globalExceptionHandler(err, req, res, next)`** | Bắt buộc đủ 4 tham số để Express nhận diện đây là Error Middleware, không phải Route |

```js
// Controller chỉ cần ném lỗi — không cần xử lý
return next(new AppError(ErrorCodes.AUTH_USER_EXISTS));

// globalExceptionHandler lo phần còn lại
app.use((err, req, res, next) => { ... });
```

- **Success:** `{ success: true, result: [...] }`
- **Error:** `{ success: false, error: { code: XXX, message: "..." } }`

### 🗺️ Dịch vụ địa lý tự động (Geo-Automation)

`GeoService` tự động chuyển đổi tọa độ (Lat/Lon) từ thiết bị di động thành địa chỉ văn bản chính xác thông qua OpenStreetMap API, giảm thiểu thao tác nhập liệu cho người dùng.

```
Request → Route → Controller → Service → Model
                      ↑             ↑
               Chỉ điều hướng   Logic nghiệp vụ
                                & gọi API ngoài
```

### 🔐 Bảo mật & Cấu hình môi trường

- **Dotenv** được nạp ở **dòng đầu tiên** của `server.js` — đảm bảo mọi biến môi trường (`JWT_SECRET`, `MONGO_URI`) sẵn sàng trước khi bất kỳ module nào khởi động.
- **Swagger Authorize** — hỗ trợ dán JWT Token trực tiếp lên Swagger UI để test các endpoint yêu cầu xác thực mà không cần Postman.

### ⚙️ Quy trình DevOps & Testing

- **Test Suite tự động** kiểm tra toàn bộ luồng nghiệp vụ theo thứ tự:

```
Đăng ký tài khoản → Đăng nhập lấy Token → Tạo / Cập nhật / Xóa sự cố
```

- Dùng `Date.now()` để sinh username ngẫu nhiên, tránh trùng lặp giữa các lần chạy test.

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
      √ Swagger UI: Nên truy cập được trang tài liệu API (36 ms)
      √ Error Handling: Nên trả về JSON chuẩn 404 khi sai URL (15 ms)
    🔐 Nhóm: Xác thực (US-15)
      √ Register: Nên đăng ký tài khoản thành công (111 ms)
      √ Login: Nên trả về Token khi đăng nhập đúng (79 ms)
    🚨 Nhóm: Quản lý sự cố (US-01)
      √ Create Incident: Nên tạo sự cố thành công khi có Token (28 ms)
      √ Update Incident: Cập nhật sự cố thành công (21 ms)
      √ Delete Incident: Xóa sự cố thành công (11 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        3.13 s      
```

### Kết quả Coverage

- **Test Suites:** 1 passed
- **Tests:** 12 passed (100% thành công)
- **Overall Coverage: > 86%** (Vượt mức tiêu chuẩn 80%)

```
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines | 
----------------------------|---------|----------|---------|---------|
All files                   |    82.6 |    57.14 |   86.95 |   83.33 | 
 src                        |     100 |      100 |     100 |     100 | 
  app.js                    |     100 |      100 |     100 |     100 | 
 src/controllers            |   75.72 |    61.29 |      80 |   76.28 | 
  authController.js         |   86.66 |       60 |     100 |   86.66 | 
  incidentController.js     |   71.23 |    61.53 |      75 |   71.64 | 
 src/middleware             |   85.45 |       48 |     100 |   85.18 | 
  AppError.js               |     100 |      100 |     100 |     100 | 
  auth.js                   |      75 |       50 |     100 |   74.07 | 
  globalExceptionHandler.js |     100 |    44.44 |     100 |     100 | 
  upload.js                 |   92.85 |       50 |     100 |   92.85 | 
 src/models                 |   92.85 |       50 |     100 |     100 | 
  Incident.js               |    90.9 |       50 |     100 |     100 | 
  Users.js                  |     100 |      100 |     100 |     100 | 
 src/routes                 |     100 |      100 |     100 |     100 | 
  authRoutes.js             |     100 |      100 |     100 |     100 | 
  incidentRoutes.js         |     100 |      100 |     100 |     100 | 
 src/services               |   33.33 |      100 |       0 |   33.33 | 
  geoService.js             |   33.33 |      100 |       0 |   33.33 | 
 src/utils                  |     100 |       50 |     100 |     100 | 
  logger.js                 |       0 |        0 |       0 |       0 | 
  response.js               |     100 |       50 |     100 |     100 | 
 src/utils/constants        |     100 |      100 |     100 |     100 | 
  errorCodes.js             |     100 |      100 |     100 |     100 | 
  successCodes.js           |     100 |      100 |     100 |     100 | 
----------------------------|---------|----------|---------|---------|
```

> ✅ **Coverage hiện tại: 82.6% Statements / 83.33% Lines** — đã vượt mức tối thiểu **80%** theo yêu cầu dự án.

### Tự động hóa CI/CD

- **Trạng thái:** ✅ Passing (12/12 test case thành công)
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
# Luôn tạo nhánh mới từ main mới nhất
git checkout main
git pull origin main

# Tạo và chuyển sang nhánh mới
git checkout -b feature/ten-tinh-nang
# Ví dụ:
# git checkout -b feature/incident-report
# git checkout -b fix/auth-401-status
```

### Bước 3 — Code & commit thường xuyên
```bash
# Kiểm tra file đã thay đổi
git status

# Stage các file cần commit
git add .

# Commit với message rõ ràng
git commit -m "feat: mô tả ngắn gọn những gì vừa làm"
# Ví dụ:
# git commit -m "feat: thêm validation tọa độ cho incident"
# git commit -m "fix: sửa auth middleware trả về 401 thay vì 403"
```

> **Gợi ý commit message:** `feat:` cho tính năng mới, `fix:` cho sửa lỗi, `refactor:` cho tái cấu trúc, `test:` cho viết test, `docs:` cho tài liệu.

### Bước 4 — Đồng bộ với `main` trước khi merge
```bash
# Kéo code mới nhất từ main về
git fetch origin
git rebase origin/main

# Nếu có conflict, giải quyết từng file rồi chạy tiếp
git add .
git rebase --continue

# Nếu muốn bỏ cuộc, quay về trạng thái trước khi rebase:
git rebase --abort
```

### Bước 5 — Push nhánh lên GitHub
```bash
git push origin feature/ten-tinh-nang
```

### Bước 6 — Tạo Pull Request (PR)

1. Vào GitHub → chọn **"Compare & pull request"**
2. Điền mô tả rõ PR này làm gì, fix lỗi nào, hoặc thêm tính năng gì
3. Assign cho ít nhất **1 người review**
4. Chờ review → sửa nếu có góp ý → **Merge vào `main`** khi được approve

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

Sau khi chạy Backend, truy cập đường dẫn sau để xem và test các API (Đăng ký, Đăng nhập, Báo cáo sự cố):

👉 `http://localhost:5000/api-docs`

---

<p align="center">Made with ❤️ by <strong>Lê Thanh Vy</strong> — CNTT4-K64 UTC</p>
