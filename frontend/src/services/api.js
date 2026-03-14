import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
});

// 1. Request Interceptor: Tự động đính kèm Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Xử lý ErrorCode từ Backend
api.interceptors.response.use(
  (response) => response.data, // Chỉ lấy data cho gọn
  (error) => {
    const res = error.response;
    if (res && res.data && res.data.error) {
      // Ví dụ: ErrorCode 1002 là sai pass
      console.error(`Lỗi hệ thống [${res.data.error.code}]: ${res.data.error.message}`);
      // Vy có thể dùng Toast library ở đây để hiện thông báo cho người dùng
    }
    return Promise.reject(error);
  }
);

export default api;