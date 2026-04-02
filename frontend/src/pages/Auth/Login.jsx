import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../store/slices/authSlice";
import { Loader2 } from "lucide-react";
import api from "../../services/api";
import { USER_ROLES } from "../../utils/constants/userConstants";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //lay tu redux store
  const { user } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case USER_ROLES.ADMIN:
          navigate("/admin/dashboard");
          break;
        case USER_ROLES.DISPATCHER:
          navigate("/dispatcher/dashboard");
          break;
        case USER_ROLES.RESCUE:
          navigate("/rescue/dashboard");
          break;
        case USER_ROLES.CITIZEN:
          navigate("/citizen/dashboard");
          break;
        default:
          navigate("/");
      }
    }
  }, [user, navigate]); // mang phu thuoc

  const handleLogin = async (e) => {
    e.preventDefault(); //ngan cho reset input
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await api.post("/auth/login", {
        username: username,
        password: password,
      });

      const { user: loggedInUser } = response.data.result;

      dispatch(loginSuccess({ user: loggedInUser })); //user o day chinhla payload

      switch (loggedInUser.role) {
        case USER_ROLES.ADMIN:
          navigate("/admin/dashboard");
          break;
        case USER_ROLES.DISPATCHER:
          navigate("/dispatcher/dashboard");
          break;
        case USER_ROLES.RESCUE:
          navigate("/rescue/dashboard");
          break;
        case USER_ROLES.CITIZEN:
          navigate("/citizen/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Lỗi này: " + error);
      /* nếu sv sập error.response sẽ là undefined -> làm sập toàn bộ giao diện màn hình.
      Dấu ?. -> tự động dừng lại và trả về undefined nếu đoạn phía trước nó không tồn tại */
      if (error.response?.data?.error?.message) {
        setErrorMsg(error.response.data.error.message);
      } else {
        setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return null; // Hoặc có thể return một màn hình Loading toàn trang
  }

  return (
    <div className="min-h-screen w-full bg-[#F2F2F7] md:bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-[420px] bg-[#F2F2F7] md:bg-white min-h-screen md:min-h-0 md:rounded-2xl md:shadow-xl p-8 sm:p-10 flex flex-col justify-center">
        <div className="text-center mb-10 mt-8 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Cứu hộ giao thông
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Đăng nhập hệ thống
          </p>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[17px] font-medium text-gray-900">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-[#C6C6C8] bg-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Nhập tên đăng nhập..."
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[17px] font-medium text-gray-900">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-[#C6C6C8] bg-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Nhập mật khẩu..."
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end mt-[-8px]">
            <span className="text-[#496FC0] text-sm font-medium hover:underline cursor-pointer transition-all">
              Quên mật khẩu?
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 h-12 bg-[#EDCA30] hover:bg-[#dcb928] disabled:bg-[#dcb928]/50 disabled:cursor-not-allowed text-gray-900 text-[17px] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <span
            className="text-[#496FC0] font-bold hover:underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Đăng ký ngay
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
