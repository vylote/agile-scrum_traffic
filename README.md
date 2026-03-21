# 🚦 Hệ thống Quản lý Sự cố Giao thông (TIMS)

> **Traffic Incident Management System** — Giải pháp hỗ trợ báo cáo và điều phối cứu hộ giao thông thời gian thực.

| Thông tin | Chi tiết |
|---|---|
| **Lớp** | CNTT4 - K64 |
| **Quy trình** | Agile/Scrum (Sprint 1: Cấu trúc hạ tầng & Báo cáo sự cố) |

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

## ⚙️ 3. Công nghệ sử dụng

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

## 🏆 5. Điểm nổi bật kiến trúc (Sprint 1 — Cải tiến kỹ thuật)

### 1. Hệ thống xử lý lỗi tập trung (Error Handling Pipeline)

Thay vì viết `try-catch` và `res.status()` rải rác khắp nơi, hệ thống áp dụng mô hình **"Phễu lỗi"** tập trung:

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

### 2. Bảo mật & Cấu hình môi trường

- **Dotenv** được nạp ở **dòng đầu tiên** của `server.js` — đảm bảo mọi biến môi trường (`JWT_SECRET`, `MONGO_URI`) sẵn sàng trước khi bất kỳ module nào khởi động.
- **Swagger Authorize** — hỗ trợ dán JWT Token trực tiếp lên Swagger UI để test các endpoint yêu cầu xác thực mà không cần Postman.

### 3. Tách biệt Service — Controller

```
Request → Route → Controller → Service → Model
                      ↑             ↑
               Chỉ điều hướng   Logic nghiệp vụ
                                & gọi API ngoài
```

- **Controller** chỉ nhận Request, gọi Service, trả Response — không chứa logic phức tạp.
- **GeoService** tự động dịch ngược tọa độ thành địa chỉ (Reverse Geocoding) qua Axios → OpenStreetMap, tích hợp thực tiễn cho bài toán cứu hộ giao thông.

### 4. Quy trình DevOps & Testing

- **Git conflict** được xử lý bằng `git pull --rebase` trước khi push, đồng bộ local và remote.
- **Test Suite tự động** kiểm tra toàn bộ luồng nghiệp vụ theo thứ tự:

```
Đăng ký tài khoản → Đăng nhập lấy Token → Dùng Token tạo sự cố
```

- Dùng `Date.now()` để sinh username ngẫu nhiên, tránh trùng lặp giữa các lần chạy test.

### 📊 Trước & Sau Sprint 1

| Đặc điểm | Trước | Sau |
|---|---|---|
| **Xử lý lỗi** | `try-catch` + `res.status()` rải rác | `AppError` + `globalExceptionHandler` tập trung |
| **Tài liệu API** | Ghi chú tay / Postman | Swagger UI tự động, có sẵn JSON example |
| **Cấu trúc code** | Logic gọi API ngoài nằm trong Controller | Tách Service riêng, Controller chỉ điều hướng |
| **Testing** | Test thủ công từng endpoint | Test Suite tự động kiểm tra cả luồng |

---

## 🧪 6. Kiểm thử & Chất lượng (Sprint 1 — Kết quả thực tế)

### Chạy test

```bash
cd backend
npm test
```

### Kết quả Unit Test

```
PASS  src/tests/app.test.js
  🚀 TIMS - KIỂM THỬ TÍCH HỢP TOÀN DIỆN (SPRINT 1)
    📁 Nhóm: Hạ tầng & Tài liệu
      √ Swagger UI: Nên truy cập được trang tài liệu API (32 ms)
      √ Error Handling: Nên trả về JSON chuẩn 404 khi sai URL (13 ms)
    🔐 Nhóm: Xác thực (US-15)
      √ Register: Nên đăng ký tài khoản thành công (100 ms)
      √ Register: Nên báo lỗi 1001 nếu trùng username (8 ms)
      √ Login: Nên trả về Token khi đăng nhập đúng (71 ms)
      √ Login: Nên từ chối (401) nếu sai mật khẩu (66 ms)
      √ Login: từ chối (401) nếu không tồn tại tên đăng nhập (6 ms)
    🚨 Nhóm: Quản lý sự cố (US-01)
      √ Security: Không có Token thì không được lấy danh sách sự cố (5 ms)
      √ Create Incident: Nên tạo sự cố thành công khi có Token (21 ms)
      √ Validation: Nên báo lỗi nếu thiếu tọa độ (Lat/Lon) (6 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Time:        3.332 s
```

### Báo cáo Coverage

```
----------------------------|---------|----------|---------|---------|-------------------
File                        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------------|---------|----------|---------|---------|-------------------
All files                   |   85.62 |    68.29 |    62.5 |   86.14 |
 src                        |     100 |      100 |     100 |     100 |
  app.js                    |     100 |      100 |     100 |     100 |
 src/controllers            |   85.45 |    83.33 |      60 |   87.03 |
  authController.js         |   92.85 |      100 |     100 |   92.85 | 82,146
  incidentController.js     |   77.77 |       70 |   33.33 |   80.76 | 85,102-109
 src/middleware             |      80 |    57.14 |    62.5 |      80 |
  AppError.js               |     100 |      100 |     100 |     100 |
  auth.js                   |    82.6 |       80 |     100 |    82.6 | 21,26-27,34
  globalExceptionHandler.js |     100 |    44.44 |     100 |     100 | 12-25
  upload.js                 |   57.14 |        0 |       0 |   57.14 | 9-14,20-23
 src/models                 |     100 |      100 |     100 |     100 |
  Incident.js               |     100 |      100 |     100 |     100 |
  Users.js                  |     100 |      100 |     100 |     100 |
 src/routes                 |     100 |      100 |     100 |     100 |
  authRoutes.js             |     100 |      100 |     100 |     100 |
  incidentRoutes.js         |     100 |      100 |     100 |     100 |
 src/services               |   33.33 |      100 |       0 |   33.33 |
  geoService.js             |   33.33 |      100 |       0 |   33.33 | 6-23
 src/utils                  |     100 |       50 |     100 |     100 |
  logger.js                 |       0 |        0 |       0 |       0 |
  response.js               |     100 |       50 |     100 |     100 | 9
 src/utils/constants        |     100 |      100 |     100 |     100 |
  errorCodes.js             |     100 |      100 |     100 |     100 |
  successCodes.js           |     100 |      100 |     100 |     100 |
----------------------------|---------|----------|---------|---------|-------------------
```

> ✅ **Coverage hiện tại: 85.62% Statements / 86.14% Lines** — đã vượt mức tối thiểu **80%** theo yêu cầu dự án.

### Roadmap nâng Coverage

Các file chưa đạt mức tối ưu cần tiếp tục cải thiện ở Sprint tiếp theo:

| File | % Stmts | % Funcs | Việc cần làm |
|---|---|---|---|
| `incidentController.js` | 77.77% | 33.33% | Viết test cho cập nhật, xóa sự cố (line 85, 102–109) |
| `geoService.js` | 33.33% | 0% | Mock Axios, test Reverse Geocoding & lỗi mạng |
| `upload.js` | 57.14% | 0% | Test upload file hợp lệ / sai định dạng / quá dung lượng |
| `auth.js` | 82.6% | 100% | Test token sai định dạng, token hết hạn (line 21, 26–27, 34) |
| `logger.js` | 0% | 0% | Bổ sung test hoặc loại khỏi coverage report |

### Tự động hóa CI/CD

- **Trạng thái:** ✅ Passing (10/10 test case thành công)
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

<p align="center">Made with ❤️ by <strong>Lê Thanh Vy</strong> — CNTT4 - K64</p>
