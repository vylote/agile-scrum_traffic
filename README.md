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
FAIL  src/tests/app.test.js (22.655 s)
  🚀 TIMS - KIỂM THỬ TÍCH HỢP TOÀN DIỆN (SPRINT 1)
    📁 Hạ tầng & Tài liệu
      √ Swagger UI: Nên truy cập được trang tài liệu API (52 ms)
      × Error Handling: Nên trả về JSON chuẩn 404 khi sai URL (12 ms)
    🔐 Xác thực (US-15)
      × Register: Nên đăng ký tài khoản thành công (5012 ms)
      × Register: Nên báo lỗi 1001 nếu trùng username (5008 ms)
      × Login: Nên trả về Token khi đăng nhập đúng (5002 ms)
      × Login: Nên từ chối (401) nếu sai mật khẩu (5016 ms)
    🚨 Quản lý sự cố (US-01)
      × Security: Không có Token thì không được lấy danh sách sự cố (6 ms)
      × Create Incident: Nên tạo sự cố thành công khi có Token (6 ms)
      × Validation: Nên báo lỗi nếu thiếu tọa độ (Lat/Lon) (6 ms)

Test Suites: 1 failed, 1 total
Tests:       8 failed, 1 passed, 9 total
Time:        23.192 s
```

### Báo cáo Coverage

```
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   65.80 |    26.82 |   42.85 |   65.80 |
 src/app.js                 |  100.00 |   100.00 |  100.00 |  100.00 |
 src/controllers            |   46.29 |     0.00 |   50.00 |   46.29 |
  authController.js         |   60.71 |     0.00 |  100.00 |   60.71 |
  incidentController.js     |   30.76 |     0.00 |    0.00 |   30.76 |
 src/middleware             |   66.00 |    52.38 |   50.00 |   66.00 |
  auth.js                   |   52.17 |    50.00 |   66.66 |   52.17 |
  upload.js                 |   57.14 |     0.00 |    0.00 |   57.14 |
 src/models                 |  100.00 |   100.00 |  100.00 |  100.00 |
 src/routes                 |  100.00 |   100.00 |  100.00 |  100.00 |
 src/services/geoService.js |   37.50 |   100.00 |    0.00 |   37.50 |
 src/utils/response.js      |   60.00 |     0.00 |    0.00 |   60.00 |
----------------------------|---------|----------|---------|---------|
```

> ⚠️ **Coverage hiện tại: 65.80% Statements / 65.80% Lines** — chưa đạt mức tối thiểu **80%** theo yêu cầu dự án.

### Phân tích lỗi & hướng khắc phục

| Test case | Trạng thái | Nguyên nhân | Hướng xử lý |
|---|---|---|---|
| Swagger `/api-docs` | ✅ Pass | — | — |
| 404 JSON chuẩn khi sai URL | ❌ Body rỗng | `globalExceptionHandler` chưa bắt route không tồn tại | Thêm `404 handler` trước `globalExceptionHandler` trong `app.js` |
| Register / Login (4 test) | ❌ Timeout 5000ms | Kết nối MongoDB thật bị treo trong môi trường test | Dùng `mongodb-memory-server` hoặc `jest.setTimeout(15000)` |
| Security danh sách sự cố | ❌ Nhận `403` thay vì `401` | Middleware `auth.js` trả Forbidden thay vì Unauthorized | Sửa status code về `401` trong `auth.js` |
| Create Incident có Token | ❌ `success: false` | Token không hợp lệ do test Register bị timeout trước | Sửa timeout → test này sẽ pass theo |
| Validation thiếu tọa độ | ❌ Nhận `403` thay vì `400` | Middleware auth chặn trước khi đến bước validation | Sửa `401` ở `auth.js` hoặc dùng token hợp lệ trong test |

### Roadmap nâng Coverage lên ≥ 80%

| File ưu tiên | Coverage hiện tại | Việc cần làm |
|---|---|---|
| `incidentController.js` | 30.76% | Viết test cho tạo, cập nhật, xóa sự cố |
| `authController.js` | 60.71% | Bổ sung test login thất bại, token hết hạn |
| `geoService.js` | 37.50% | Mock Axios, test Reverse Geocoding & lỗi mạng |
| `auth.js` (middleware) | 52.17% | Test token hợp lệ / sai / hết hạn |

### Tự động hóa CI/CD

- **Trạng thái:** ⚠️ Failing (do 8/9 test case thất bại)
- **Luồng chạy:** Mỗi khi push lên `main` → GitHub Actions khởi tạo Node 22 → `npm install` → Docker Build → Jest

---

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

## 🔑 8. Tài liệu API (Swagger)

Sau khi chạy Backend, truy cập đường dẫn sau để xem và test các API (Đăng ký, Đăng nhập, Báo cáo sự cố):

👉 `http://localhost:5000/api-docs`

---

<p align="center">Made with ❤️ by <strong>Lê Thanh Vy</strong> — CNTT4 - K64</p>
