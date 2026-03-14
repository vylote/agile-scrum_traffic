# 🚦 Hệ thống Quản lý Sự cố Giao thông
> **Traffic Incident Management System**

| Thông tin | Chi tiết |
|-----------|----------|
| **Lớp** | CNTT4 - K64 |
| **Quy trình** | Agile/Scrum (5 Sprints) |

---

## 👥 Thành viên nhóm

| Vai trò | Họ và tên | MSSV | Trách nhiệm |
|---------|-----------|------|-------------|
| **Product Owner** | Nguyễn Văn A | 23122XXXX | Quản lý Product Backlog, ưu tiên tính năng, xác nhận kết quả Sprint |
| **Scrum Master** | Trần Thị B | 23122XXXX | Loại bỏ trở ngại, tổ chức ceremonies, đảm bảo quy trình Scrum |
| **Backend Developer** | Lê Văn C | 23122XXXX | Node.js, Express, Socket.IO, MongoDB, REST API |
| **Frontend Developer** | Phạm Thị D | 23122XXXX | React.js, Redux, Leaflet Maps, Responsive UI |
| **Full-stack Developer** | Hoàng Văn E | 23122XXXX | Node.js + React.js, tích hợp API, DevOps |

---

## 🏗️ 1. Kiến trúc hệ thống

Dự án được phát triển theo phương pháp **Agile/Scrum** với 5 Sprint, kết hợp kiến trúc phần mềm **Client-Server** và mô hình **Phân lớp (Layered Architecture)**.

| Khía cạnh | Mô tả |
|-----------|-------|
| **Quy trình phát triển** | Agile/Scrum — chia thành 5 Sprint, mỗi Sprint có Sprint Planning, Daily Standup, Sprint Review và Retrospective |
| **Kiến trúc phần mềm** | Client-Server — Frontend (React) giao tiếp với Backend (Node.js) qua REST API và Socket.IO |
| **Tổ chức mã nguồn** | Layered Architecture — tách biệt rõ ràng giữa Routes, Controllers, Services, Models |

---

## 📁 2. Cấu trúc dự án

### Backend — `backend/src/`

Thư mục Backend được tổ chức để tách biệt rõ ràng giữa logic nghiệp vụ, dữ liệu và các dịch vụ hỗ trợ:

```
backend/src/
├── config/        # Cấu hình MongoDB, JWT, Firebase
├── controllers/   # Điều khiển: incident, rescue, user, report
├── middleware/    # auth, upload, validation, errorHandler
├── models/        # Schemas: Incident, RescueTeam, User, Notification
├── routes/        # API endpoints (api/v1/...)
├── services/      # geocoding, phân công tự động, thông báo, Socket.IO
├── jobs/          # Bull Queue: autoAssign, báo cáo hàng ngày
├── utils/         # helpers, logger
├── app.js         # Khởi tạo ứng dụng
└── server.js      # Vận hành cổng mạng
```

| Thư mục | Mô tả |
|---------|-------|
| `config/` | Thiết lập cấu hình cho MongoDB, xác thực JWT và dịch vụ Firebase |
| `controllers/` | Xử lý logic điều khiển cho sự cố (incident), đội cứu hộ (rescue), người dùng (user) và báo cáo (report) |
| `middleware/` | Xác thực (auth), tải tệp (upload), kiểm tra dữ liệu đầu vào (validation), xử lý lỗi tập trung (errorHandler) |
| `models/` | MongoDB Schemas: Incident, RescueTeam, User, Notification |
| `routes/` | Định nghĩa các đường dẫn API (`api/v1/...`) |
| `services/` | Geocoding, thuật toán phân công tự động, dịch vụ thông báo, Socket.IO |
| `jobs/` | Tác vụ nền qua Bull Queue: tự động phân công (`autoAssign`), tạo báo cáo hàng ngày |
| `utils/` | Helpers và logger hệ thống |

### Frontend — `frontend/src/`

Thư mục Frontend được tổ chức theo thành phần giao diện và quản lý trạng thái tập trung:

```
frontend/src/
├── assets/        # Tài nguyên tĩnh (react.svg, hình ảnh, icon...)
├── components/    # Map, IncidentCard, StatusBadge, Navbar
├── pages/         # Home, BáoCáo, Dashboard, RescueDashboard, Admin
├── store/         # Redux Toolkit: incident, rescue, auth, notification
├── hooks/         # useSocket, useGeolocation, useAuth
├── services/      # api.js (HTTP), Socket.IO client
├── utils/         # formatters, geoUtils
├── App.jsx        # Cấu hình chính
└── main.jsx       # Điểm khởi động React
```

| Thư mục | Mô tả |
|---------|-------|
| `assets/` | Tài nguyên tĩnh mặc định của Vite: `react.svg`, hình ảnh, icon và các file media |
| `components/` | Thành phần dùng chung: Map, IncidentCard, StatusBadge, Navbar |
| `pages/` | Trang chủ, Báo cáo sự cố, Dashboard điều phối, Bảng điều khiển đội cứu hộ, Trang Admin |
| `store/` | Redux Toolkit quản lý trạng thái: sự cố, đội cứu hộ, xác thực, thông báo |
| `hooks/` | Custom Hooks: `useSocket`, `useGeolocation`, `useAuth` |
| `services/` | Quản lý HTTP request (`api.js`) và kết nối Socket.IO client |
| `utils/` | Hàm định dạng dữ liệu (formatters) và tiện ích địa lý (geoUtils) |

---

## ⚙️ 3. Công nghệ sử dụng

### Backend
| Thành phần | Công nghệ |
|------------|-----------|
| **Runtime** | Node.js v22+ |
| **Framework** | Express.js |
| **Database** | MongoDB + Mongoose |
| **Realtime** | Socket.IO |
| **Xác thực** | JWT (JSON Web Token) |
| **Thông báo** | Firebase Admin SDK |
| **Hàng đợi** | Bull Queue + Redis |
| **API Docs** | Swagger UI |
| **Kiểm thử** | Jest & Supertest |
| **Hạ tầng** | Docker |

### Frontend
| Thành phần | Công nghệ |
|------------|-----------|
| **Framework** | React |
| **Build tool** | Vite |
| **State management** | Redux Toolkit |
| **Kết nối API** | REST HTTP + Socket.IO |

---

## 🚀 4. Cài đặt & Khởi chạy

### Yêu cầu hệ thống
- ✅ Node.js v22+
- ✅ Docker Desktop
- ✅ Git

### Bước 1 — Tải mã nguồn
```bash
git clone https://github.com/vylote/agile-scrum_traffic.git
cd agile-scrum_traffic
```

### Bước 2 — Cài đặt thư viện
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

## 🔑 5. Cấu hình môi trường

> **Lưu ý:** Các tệp sau bị chặn bởi `.gitignore` vì lý do bảo mật — cần tạo thủ công.

### 5.1. Tạo file `.env`

Tạo file tại `backend/.env` với nội dung:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/incident_db
JWT_SECRET=lien_he_vy_de_lay_ma
```

### 5.2. Cấu hình Firebase

Đặt file `firebase-service-account.json` vào đúng đường dẫn:

```
backend/src/config/firebase-service-account.json
```

---

## 💻 6. Vận hành dự án

### Bước 1 — Khởi động hạ tầng (Docker)

```bash
# Chạy tại thư mục gốc dự án
docker-compose up -d
```

> Lệnh này khởi động các container **MongoDB** và **Redis** cục bộ.

### Bước 2 — Chạy Backend

```bash
cd backend
npm run dev
```

| Dịch vụ | URL |
|---------|-----|
| API Server | http://localhost:5000 |
| Swagger UI | http://localhost:5000/api-docs |

### Bước 3 — Chạy Frontend

```bash
cd frontend
npm run dev
```

---

## 🧪 7. Kiểm thử & Chất lượng

### Chạy Unit Test

```bash
cd backend
npm test
```

### Kết quả hiện tại

```
PASS  src/tests/app.test.js
  Kiểm tra các Endpoint cơ bản
    √ Nên trả về thông báo chào mừng tại đường dẫn / (34 ms)
    √ Nên trả về status 200 khi gọi /api/test (5 ms)

----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------|---------|----------|---------|---------|-------------------
All files       |   59.09 |   100.00 |   66.66 |   57.14 |
 src            |  100.00 |   100.00 |  100.00 |  100.00 |
  app.js        |  100.00 |   100.00 |  100.00 |  100.00 |
 src/middleware |    0.00 |   100.00 |    0.00 |    0.00 | 1-12
  upload.js     |    0.00 |   100.00 |    0.00 |    0.00 | 1-12
 src/models     |    0.00 |   100.00 |  100.00 |    0.00 | 1-14
  Incident.js   |    0.00 |   100.00 |  100.00 |    0.00 | 1-14
----------------|---------|----------|---------|---------|-------------------

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Time:        2.308 s
```

> ⚠️ **Coverage hiện tại chưa đạt yêu cầu** — tổng coverage đạt **59.09% Statements / 57.14% Lines**, thấp hơn mức tối thiểu **80%** theo yêu cầu dự án.

### Nguyên nhân & hướng khắc phục

| File chưa được test | Coverage | Hướng khắc phục |
|--------------------|----------|-----------------|
| `src/middleware/upload.js` | 0% | Viết test cho middleware upload (mock Multer) |
| `src/models/Incident.js` | 0% Lines | Viết test kiểm tra Schema validation và các trường bắt buộc |

**Để đạt mục tiêu ≥ 80%, cần bổ sung:**
- Test cho `upload.js`: mock `multer`, kiểm tra filter định dạng file, giới hạn kích thước
- Test cho `Incident.js`: tạo/validate document, kiểm tra required fields, kiểm tra enum values

### Xem báo cáo chi tiết

Sau khi chạy test, mở file sau bằng trình duyệt:

```
backend/coverage/lcov-report/index.html
```

---



Made with ❤️ by Nhóm CNTT4 - K64