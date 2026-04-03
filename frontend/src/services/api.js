import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, 
});

api.interceptors.response.use(
  function onFulfilled(response) {
    return response; // Trả thẳng kết quả về cho try/catch (hoặc then) ở Component
  }, 

  async function onRejected(error) {
    let req = error.config; // Lưu lại toàn bộ cấu hình của request cũ (URL, data, header...)

    if (error.response?.status === 401 && !req._retry && req.url !== '/auth/refresh-token') { 
      req._retry = true; 
      
      try {
        await api.post('/auth/refresh-token');
        return api(req); 

      } catch (err) {
        console.error("Phiên đăng nhập đã hết hạn hoàn toàn: ", err);
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    // Nếu là các lỗi khác (400, 404) thì ném lỗi ra cho catch() ở Component tự lo
    return Promise.reject(error);
  }
);

export default api;