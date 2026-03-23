# 🚦 Hệ thống Quản lý Sự cố Giao thông (TIMS)

> **Traffic Incident Management System** — Giải pháp quản lý sự cố giao thông thông minh, hỗ trợ báo cáo và điều phối cứu hộ thời gian thực với cơ chế đồng bộ hóa tài nguyên (Resource Sync) và tự động dọn dẹp (Auto-Cleanup).

| Thông tin | Chi tiết |
|---|---|
| **Lớp** | CNTT4 - K64 |
| **Quy trình** | Agile/Scrum (Sprint 1 → Sprint 1.5: Resource Management) |
| **Trạng thái** | ✅ Hoàn thành Logic nâng cao — 44/44 tests passed |

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

Dự án được xây dựng trên mô hình **Client-Server** với sự tách biệt rõ ràng giữa các tầng:

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
│   ├── config/          # Cấu hình Swagger, Database connection
│   ├── controllers/     # Logic xử lý chính (Đồng bộ ảnh, SOS, Incidents)
│   ├── middleware/      # Auth (Protect), Multer (Upload), Error Handler
│   ├── models/          # Mongoose Schemas (User, Incident)
│   ├── routes/          # API Routing (Auth, Incidents)
│   ├── services/        # GeoService (Reverse Geocoding qua OSM)
│   ├── tests/           # Integration Tests (Jest + Supertest)
│   └── utils/
│       ├── constants/   # Mã lỗi & Mã thành công chuẩn hóa
│       ├── cleanupTask.js  # Logic dọn dẹp ảnh mồ côi 🗑️
│       └── response.js  # Helper trả về JSON chuẩn
├── uploads/             # Kho lưu trữ ảnh vật lý
├── .env                 # Biến môi trường (JWT, Mongo URI, Port)
├── app.js               # Cấu hình Express & Middleware
└── server.js            # Điểm khởi chạy & Thiết lập Cron Jobs
```

---

## ⚙️ 3. Công nghệ sử dụng

| Công nghệ | Vai trò | Trạng thái |
|---|---|---|
| **Docker** | Đóng gói ứng dụng vào Container để chạy trên mọi môi trường | ✅ Đã cấu hình |
| **GitHub Actions** | Tự động chạy Test và Build mỗi khi Push code | ✅ Đã cấu hình |
| **Swagger UI** | Tài liệu API tương tác, hỗ trợ test Upload ảnh trực tiếp | ✅ Đã cấu hình |
| **Socket.IO** | Phát tán sự cố & SOS thời gian thực đến các bên liên quan | ✅ Đã cấu hình |
| **node-cron** | Lập lịch tác vụ dọn dẹp ảnh mồ côi chạy ngầm hàng ngày | ✅ Đã cấu hình |
| **Axios Interceptor** | Tự động xử lý Header Authorization (Bearer Token) | ✅ Đã cấu hình |

---

## 🚀 4. Cài đặt & Vận hành nhanh

### Yêu cầu hệ thống

- Node.js v18+
- MongoDB v6.0+
- Docker & Docker Compose (tùy chọn)

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

## 🏆 5. Đặc điểm kỹ thuật nổi bật

### 1. Hệ thống xử lý lỗi tập trung (Error Handling Pipeline)

Thay vì viết `try-catch` và `res.status()` rải rác khắp nơi, hệ thống áp dụng mô hình **"Phễu lỗi"** tập trung:

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

Cấu trúc phản hồi chuẩn hóa toàn hệ thống:

- **Success:** `{ success: true, result: data }`
- **Error:** `{ success: false, error: { code: 1xxx, message: "..." } }`

### 2. Bảo mật & Cấu hình môi trường

- **Dotenv** được nạp ở **dòng đầu tiên** của `server.js` — đảm bảo mọi biến môi trường sẵn sàng trước khi bất kỳ module nào khởi động.
- Middleware kiểm tra `isActive` — chặn ngay lập tức tài khoản bị khóa dù có Token hợp lệ.
- JWT ký với thuật toán **HS256**, thời hạn `1d`.
- **Swagger Authorize** — hỗ trợ dán JWT Token trực tiếp để test API yêu cầu xác thực.

### 3. Tách biệt Service — Controller

```
Request → Route → Controller → Service → Model
                      ↑             ↑
               Chỉ điều hướng   Logic nghiệp vụ
                                & gọi API ngoài
```

- **GeoService** tự động dịch ngược tọa độ thành địa chỉ (Reverse Geocoding) qua Axios → OpenStreetMap.
- **Mongoose pre-save hook** sinh mã sự cố tự động theo định dạng `TYPE-YYYYMMDD-XXXX`.

### 4. Quản lý vòng đời tài nguyên (Resource Lifecycle)

API cập nhật sự cố `PATCH /:id/info` sử dụng cơ chế **Target State**:

- **Keep:** Giữ lại danh sách ảnh cũ được chọn qua field `keepPhotos`.
- **Delete:** Tự động so sánh và xóa file vật lý của ảnh không còn trong danh sách giữ lại.
- **Add:** Upload thêm ảnh mới và gộp vào bộ sưu tập hiện có.

### 5. Tự động dọn dẹp ảnh mồ côi (Auto-Cleanup)

Cron Job chạy lúc **3:00 sáng** hàng ngày, quét và xóa ảnh đã upload nhưng không thuộc về bất kỳ sự cố nào:

```js
// server.js
cron.schedule('0 3 * * *', () => {
    cleanupOrphanPhotos(); // Quét Disk vs DB để tìm ảnh mồ côi
});
```

**Grace Period Logic:** Chỉ xóa ảnh mồ côi đã tồn tại trên **2 giờ** — tránh xóa nhầm ảnh của người dùng đang thao tác dở.

### 📊 Trước & Sau Sprint 1

| Đặc điểm | Trước | Sau |
|---|---|---|
| **Xử lý lỗi** | `try-catch` + `res.status()` rải rác | `AppError` + `globalExceptionHandler` tập trung |
| **Tài liệu API** | Ghi chú tay / Postman | Swagger UI tự động, có sẵn JSON example |
| **Cấu trúc code** | Logic gọi API ngoài nằm trong Controller | Tách Service riêng, Controller chỉ điều hướng |
| **Testing** | Test thủ công từng endpoint | Test Suite tự động 44 cases kiểm tra cả luồng |
| **Quản lý file** | Upload xong không dọn | Auto-cleanup ảnh mồ côi qua Cron Job |

---

## 🧪 6. Kiểm thử & Chất lượng

### Chạy test

```bash
cd backend
npm test
```

### Kết quả Unit Test

```
PASS  src/tests/app.test.js
  🚀 TIMS - KIỂM THỬ TÍCH HỢP TOÀN DIỆN (SPRINT 1)
    📁 Hạ tầng & Tài liệu
      √ Swagger UI: Nên truy cập được trang tài liệu API (8 ms)
      √ Error Handling: Nên trả về JSON chuẩn 404 khi sai URL (5 ms)
    🔐 Xác thực
      √ Register: Nên đăng ký tài khoản thành công (86 ms)
      √ Login: Nên trả về Token khi đăng nhập đúng (85 ms)
    🚨 POST / — Tạo sự cố mới
      √ Tạo sự cố đầy đủ tất cả trường thành công (31 ms)
      √ Tạo sự cố với type và severity mặc định khi không truyền (11 ms)
      √ Thiếu latitude → lỗi INCIDENT_MISSING_COORDINATES (6 ms)
      √ Không có Token → 401 (7 ms)
      √ Token của ADMIN (không phải CITIZEN) → 403 (6 ms)
    🆘 POST /sos — Gửi tín hiệu SOS khẩn cấp
      √ Gửi SOS thành công với đầy đủ tọa độ (12 ms)
      √ Thiếu latitude → lỗi INCIDENT_MISSING_COORDINATES (8 ms)
      √ Không có Token → 401 (4 ms)
    🔍 GET /:id — Lấy chi tiết sự cố
      √ Lấy sự cố thành công với ID hợp lệ (42 ms)
      √ ID sai định dạng ObjectId → lỗi INVALID_ID_FORMAT (11 ms)
      √ ID không tồn tại → lỗi INCIDENT_NOT_FOUND (11 ms)
      √ Không có Token → 401 (5 ms)
    🔎 GET /track/:code — Lấy sự cố theo mã code
      √ Lấy sự cố thành công với code hợp lệ (14 ms)
      √ Code sai định dạng → lỗi INCIDENT_INVALID_CODE_FORMAT (8 ms)
      √ Code đúng định dạng nhưng không tồn tại → lỗi INCIDENT_NOT_FOUND (8 ms)
      √ Không có Token → 401 (4 ms)
    🔄 PATCH /:id/status — Cập nhật trạng thái
      √ Cập nhật status thành ASSIGNED (14 ms)
      √ ID không tồn tại → lỗi INCIDENT_NOT_FOUND (8 ms)
      √ Không có Token → 401 (3 ms)
    ✏️ PATCH /:id/info — Cập nhật thông tin sự cố
      √ Cập nhật đầy đủ tất cả trường thành công (27 ms)
      √ Không gửi ảnh mới → giữ nguyên ảnh cũ (28 ms)
      √ Cập nhật tọa độ có truyền address thủ công (14 ms)
      √ ID không tồn tại → lỗi INCIDENT_NOT_FOUND (9 ms)
      √ Không có Token → 401 (4 ms)
    📋 GET / — Lấy danh sách sự cố
      √ Lấy danh sách thành công với ADMIN token (18 ms)
      √ Lọc theo type, severity, status + phân trang (15 ms)
      √ CITIZEN token → 403 (7 ms)
      √ Không có Token → 401 (4 ms)
    🗑️ DELETE /delete/:id — Xóa sự cố
      √ Xóa sự cố thành công với CITIZEN token (25 ms)
      √ Xóa sự cố không có ảnh — không lỗi khi photos rỗng (41 ms)
      √ ID không tồn tại → lỗi INCIDENT_NOT_FOUND (21 ms)
      √ DISPATCHER token → 403 (18 ms)
      √ Không có Token → 401 (16 ms)

Test Suites: 1 passed, 1 total
Tests:       44 passed, 44 total
Time:        6.009 s
```

### Báo cáo Coverage

```
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   82.02 |    73.94 |   87.87 |   81.97 |
 src/app.js                 |  100.00 |   100.00 |  100.00 |  100.00 |
 src/controllers            |   87.70 |    79.81 |  100.00 |   87.07 |
  authController.js         |   74.28 |    44.44 |  100.00 |   74.28 |
  incidentController.js     |   90.78 |    86.81 |  100.00 |   90.20 |
 src/middleware             |   92.72 |    64.00 |  100.00 |   92.59 |
  auth.js                   |   89.28 |    78.57 |  100.00 |   88.88 |
  upload.js                 |   92.85 |    50.00 |  100.00 |   92.85 |
 src/models                 |   71.42 |    50.00 |  100.00 |   75.00 |
 src/routes                 |  100.00 |   100.00 |  100.00 |  100.00 |
 src/utils/response.js      |  100.00 |    50.00 |  100.00 |  100.00 |
----------------------------|---------|----------|---------|---------|
```

> ✅ **Coverage: 82.02% Statements / 81.97% Lines** — đạt mức tiêu chuẩn **≥ 80%** theo yêu cầu dự án.

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
git status
git add .
git commit -m "feat: mô tả ngắn gọn những gì vừa làm"
```

> **Gợi ý commit message:** `feat:` tính năng mới · `fix:` sửa lỗi · `refactor:` tái cấu trúc · `test:` viết test · `docs:` tài liệu

### Bước 4 — Đồng bộ với `main` trước khi push

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
| ❌ Không commit thẳng lên `main` | Mọi thay đổi phải qua PR |
| ✅ Rebase trước khi push | Tránh conflict khi merge |
| ✅ Mỗi PR chỉ làm 1 việc | Dễ review, dễ rollback nếu lỗi |
| ✅ Xóa nhánh sau khi merge | Giữ repo gọn gàng |

---

## 🔑 8. Tài liệu API (Swagger)

Sau khi khởi động Server, truy cập để xem và test đầy đủ các API — hỗ trợ Upload ảnh và test JWT trực tiếp trên trình duyệt:

👉 `http://localhost:5000/api-docs`

> **Lưu ý khi test API Update:** Field `photos` dùng để upload file binary mới. Field `keepPhotos` dùng để dán **tên** các file cũ (lấy từ DB) muốn giữ lại.

---

<p align="center">Made with ❤️ by <strong>Lê Thanh Vy</strong> — 231220965 | CNTT4-K64</p>
