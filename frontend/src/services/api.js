import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, 
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error); // kich hoat .catch((err) => Promise.reject(err)) của req sau 
    else prom.resolve(token); // kich hoat .then(() => api(originalRequest)) của req sau
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => { //khi req that bai, axios tạo Error object, lúc này mọi thông tin server được đính kèm vào response 
    const originalRequest = error.config;
    // Nếu là request Login hoặc Register mà bị 401, thì trả lỗi về ngay 
    // để Login.jsx hiển thị "Sai tài khoản/mật khẩu", ĐỪNG refresh token.
    if (
      originalRequest.url.includes('/auth/login') || 
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/refresh-token')
    ) {
      return Promise.reject(error);
    }
    //401 (hết hạn) và chưa từng retry vụ này
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // khi nào resolve/reject được gọi thì mới chạy tiếp 
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest)) // đây chính là chỗ B sẽ thực hiện req cũ với token A mang về 
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("Đang tự động làm mới phiên làm việc...");
        // ở đây một lần nữa sẽ gọi vào api và dính 401 nên lại bị chính cái interceptor này chặn 
        await api.post('/auth/refresh-token'); // nếu thất bại ở đây nó nhảy thẳng xuống catch (nhưu JAVA)
        
        isRefreshing = false;
        processQueue(null);
        
        return api(originalRequest); // Thực hiện lại request ban đầu (/auth/me)
      } catch (refreshError) { //refreshError là Standard JavaScript , hiểu đơn giản là khi gặp lỗi nó sẽ throw và mình catch nó, giống nhưu err vậy 
        isRefreshing = false;
        processQueue(refreshError, null);
        
        console.error("refresh token thất bại, yêu cầu đăng nhập lại.");
        // logout ở đây là đảm bảo local sạch do lỗi mạng
        store.dispatch(logout()); 
        return Promise.reject(refreshError); // trả lỗi về App.jsx, refresh chinh la cai Error object loi 401 server 
      }
    }

    return Promise.reject(error);
  }
);

export default api;