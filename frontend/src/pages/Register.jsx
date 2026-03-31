import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', password: '', name: '', email: '', phone: '', role: 'CITIZEN'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.name || !formData.phone) {
      setError('Vui lòng điền các trường bắt buộc!');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/auth/register', formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000); // Tự động chuyển trang sau 2s
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-10">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tạo tài khoản mới</h2>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded">Đăng ký thành công! Đang chuyển về trang Đăng nhập...</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị *</label>
              <input type="text" name="name" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
              <input type="text" name="phone" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
            <input type="text" name="username" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
            <input type="password" name="password" onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bạn là ai?</label>
            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 bg-white">
              <option value="CITIZEN">Người dân (Báo cáo sự cố)</option>
              <option value="RESCUE">Đội cứu hộ (Tiếp nhận xử lý)</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading || success} className="w-full mt-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản? <Link to="/login" className="text-blue-600 font-medium hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;