import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppRoutes } from "./routes/AppRoutes";
import { loginSuccess, logout, setInitialized } from "./store/slices/authSlice";
import api from "./services/api";
import { Loader2 } from "lucide-react";
import { setupFCM, onMessageListener } from './services/fcmService';
import { toast, Toaster } from "react-hot-toast";

function App() {
  const dispatch = useDispatch();
  const { isInitialized, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log("đang kiểm tra local storage");
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        console.log("khong tim thay cache");
        dispatch(setInitialized());
        setLoading(false);
        return;
      }

      try {
        // API này sẽ đi qua Interceptor.
        const response = await api.get("/auth/me");
        console.log("goi api thanh cong");
        dispatch(loginSuccess({ user: response.data.result.user }));
      } catch (error) { //-> catch dc cai Error Object (refreshError)
        if (error.response?.status === 401) {
          console.error("Phiên làm việc hết hạn thực sự.");
          //đảm bảo cuối cùng khi mà có sự thay đổi hệ thống, lần đầu mở máy, có thể xóa ở đây vì interceptor làm rồi  
          dispatch(logout()); //Defensive Programming
        }
      } finally {
        setLoading(false);
        dispatch(setInitialized());
      }
    };

    initAuth();
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized && user) {
      setupFCM();

      //Foreground (tiền cảnh) 24/7
      const listenForMessages = async () => {
        try {
          const payload = await onMessageListener();
          
          toast.success(
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">{payload.data.title}</span>
              <span className="text-sm text-gray-600">{payload.data.body}</span>
            </div>,
            { duration: 5000, position: "top" }
          );

          // Sau khi nhận xong 1 tin, gọi đệ quy đợi tin tiếp theo
          listenForMessages();
        } catch (err) {
          console.error("Lỗi lắng nghe tin nhắn:", err);
        }
      };

      listenForMessages();
    }
  }, [isInitialized, user]);

  // đang xác thực thì k có quyền xem các trang khác 
  if (loading || !isInitialized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F2F2F7]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0088FF]" />
        <p className="mt-4 text-gray-500 font-medium italic">
          Đang xác thực phiên làm việc...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
