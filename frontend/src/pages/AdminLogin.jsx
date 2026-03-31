import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Đường dẫn api của bạn
import { loginSuccess } from '../store/slices/authSlice'; // Redux action của bạn

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
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
        
        // CHẶN BẢO MẬT: Đảm bảo chỉ có Admin hoặc Dispatcher mới được đăng nhập vào Web Portal
        if (loggedInUser.role === 'CITIZEN' || loggedInUser.role === 'RESCUE') {
            setError('Bạn không có quyền truy cập vào Hệ thống Quản trị!');
            // (Tùy chọn) Gọi api logout ở đây để clear token nếu cần
            return; 
        }

        dispatch(loginSuccess({ user: loggedInUser }));
        navigate('/admin/dashboard'); // Điều hướng tới trang Dashboard của Admin
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Container chính phủ toàn màn hình, nền xám nhạt như Figma
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center py-10 px-4">
      
      {/* --- TIÊU ĐỀ HEADER --- */}
      <div className="text-center mb-10">
        <h1 className="text-black text-[40px] font-bold mb-2">Cứu hộ giao thông</h1>
        <h2 className="text-black text-4xl font-bold">Admin System</h2>
      </div>

      {/* --- FORM ĐĂNG NHẬP (Card Box) --- */}
      <div 
        className="bg-white w-full max-w-[800px] rounded-[20px] p-10 md:p-14"
        style={{ boxShadow: "0px 5px 10px rgba(0,0,0,0.25)" }}
      >
        <h3 className="text-black text-[40px] font-bold text-center mb-10">
          Đăng nhập
        </h3>

        {/* Khung báo lỗi (Kế thừa từ logic cũ của bạn) */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-[#FF3B30] text-base text-center rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Input Tên đăng nhập */}
          <div className="mb-6">
            <label className="block text-black text-2xl mb-2.5">
              Tên đăng nhập
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full h-12 rounded-[5px] border border-solid border-[#C6C6C8] px-4 text-xl outline-none focus:border-[#496FC0] transition-colors"
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          {/* Input Mật khẩu */}
          <div className="mb-10">
            <label className="block text-black text-2xl mb-2.5">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 rounded-[5px] border border-solid border-[#C6C6C8] px-4 text-xl outline-none focus:border-[#496FC0] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {/* Dòng cuối: Quên mật khẩu & Nút Đăng nhập */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <a href="#" className="text-[#496FC0] text-lg hover:underline cursor-pointer">
              Quên mật khẩu?
            </a>
            
            <button 
              type="submit"
              disabled={isLoading}
              className={`py-3 px-8 rounded-[10px] border border-solid border-[#C6C6C8] transition-all ${
                isLoading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-[#EDCA30] text-black hover:bg-[#d6b528] active:scale-95 cursor-pointer'
              }`}
            >
              <span className="text-lg font-bold">
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;