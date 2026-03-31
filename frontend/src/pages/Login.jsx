import { useState } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { loginSuccess } from '../store/slices/authSlice';

export const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', formData);
      
      if (response.data.success) {
        const loggedInUser = response.data.result.user;
        
        dispatch(loginSuccess({ user: loggedInUser }));

        // Phân luồng sau khi đăng nhập thành công
        if (loggedInUser.role === 'RESCUE') {
          navigate('/rescue/dashboard'); // Đội cứu hộ vào màn hình nhận nhiệm vụ
        } else if (loggedInUser.role === 'CITIZEN') {
          navigate('/'); // Người dân vào màn hình bản đồ báo sự cố
        } else {
          // Nếu Admin/Dispatcher lỡ đăng nhập ở App Mobile, có thể chặn hoặc cho phép tùy bạn
          navigate('/admin/dashboard'); 
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Dùng w-full và max-w-md để màn hình luôn co giãn đẹp trên mọi dòng điện thoại
    <div className="bg-white w-full min-h-screen flex flex-col items-center pb-10">
      
      {/* --- STATUS BAR (Giả lập thanh pin, giờ của iOS) --- */}
      <div className="w-full flex justify-between items-center pt-5 pb-4 px-6">
        <div className="font-semibold text-[17px] text-black tracking-wide">
          9:41
        </div>
      </div>

      {/* --- MAIN CONTENT KHU VỰC ĐĂNG NHẬP --- */}
      <div className="w-full max-w-[340px] flex flex-col mt-16 px-4">
        
        {/* Tiêu đề */}
        <h1 className="text-black text-[32px] sm:text-[34px] font-bold text-center mb-8 leading-tight">
          Cứu hộ giao thông
        </h1>
        <h2 className="text-black text-[22px] font-semibold text-center mb-8">
          Đăng nhập
        </h2>

        {/* Báo lỗi API */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 text-[#FF3B30] text-sm text-center rounded-[10px] border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col w-full">
          
          {/* Ô nhập Tên đăng nhập */}
          <div className="flex flex-col mb-4">
            <label 
              htmlFor="username" 
              className="text-black text-base font-medium mb-1.5"
            >
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              className="w-full h-11 rounded-[5px] border border-solid border-[#C6C6C8] bg-transparent px-3 text-base text-black outline-none focus:border-[#496fc0] transition-colors"
            />
          </div>

          {/* Ô nhập Mật khẩu */}
          <div className="flex flex-col mb-2">
            <label 
              htmlFor="password" 
              className="text-black text-base font-medium mb-1.5"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="w-full h-11 rounded-[5px] border border-solid border-[#C6C6C8] bg-transparent px-3 text-base text-black outline-none focus:border-[#496fc0] transition-colors"
            />
          </div>

          {/* Quên mật khẩu */}
          <button
            type="button"
            className="text-[#496fc0] text-sm font-medium self-start mt-2 mb-8 hover:underline"
          >
            Quên mật khẩu?
          </button>

          {/* Điều hướng Đăng ký */}
          <p className="text-center text-[#6b6f80] text-sm mb-8">
            Không có tài khoản?{" "}
            <Link to="/register" className="text-[#496fc0] font-medium hover:underline">
              Đăng ký
            </Link>
          </p>

          {/* Nút Đăng nhập (Giữ màu vàng đặc trưng #edca30 của Figma) */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-[140px] h-[40px] self-center rounded-[10px] flex items-center justify-center transition-transform ${
              isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#edca30] text-black active:scale-95'
            }`}
          >
            <span className="text-base font-medium">
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </span>
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;