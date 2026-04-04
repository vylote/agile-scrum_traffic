// App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppRoutes } from './routes/AppRoutes';
import { loginSuccess, logout, setInitialized } from './store/slices/authSlice';
import api from './services/api';
import { Loader2 } from 'lucide-react';

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log("kiem tra local storage")
      const savedUser = localStorage.getItem('user');
      // Nếu localStorage trống -> Không cần check, hiện luôn Login/Public page
      if (!savedUser) {
        console.log("khong tim thay cache")
        dispatch(setInitialized());
        setLoading(false);
        return;
      }

      try {
        // Gọi API lấy thông tin cá nhân (API này yêu cầu Auth)
        // Nó sẽ kích hoạt Interceptor nếu Access Token trong Cookie hết hạn
        const response = await api.get('/auth/me');
        console.log("goi api thanh cong")
        dispatch(loginSuccess({ user: response.data.result.user }));
      } catch (error) {
        // CHỈ logout khi Server thực sự trả về 401 (Hết hạn/Sai token)
      if (error.response?.status === 401) {
        console.error("Phiên làm việc hết hạn thực sự.");
        dispatch(logout());
      } else {
        // Nếu là lỗi 404 hoặc Mất mạng (error.code === 'ERR_NETWORK')
        // Chúng ta giữ nguyên trạng thái Redux để người dùng không bị đá văng
        console.warn("Máy chủ không phản hồi hoặc mất mạng. Giữ phiên làm việc.");
      }
      } finally {
        setLoading(false);
        dispatch(setInitialized());
      }
    };

    initAuth();
  }, [dispatch]);

  // CHẶN ĐỨNG GIAO DIỆN: Đang check thì không cho xem Dashboard
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F2F2F7]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0088FF]" />
        <p className="mt-4 text-gray-500 font-medium italic">Đang xác thực phiên làm việc...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;