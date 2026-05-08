import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // 🔥 Import useSelector
import api from '../../services/api';
import { logout } from '../../store/slices/authSlice';
import { useSocket } from '../../hooks/useSocket'; // 🔥 Import useSocket để ngắt kết nối

export const UserProfileForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket();

  // 🔥 Lấy thông tin user từ Redux Store
  const { user } = useSelector((state) => state.auth);

  // Khởi tạo state với dữ liệu mặc định (tránh lỗi null)
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    phone: '',
    email: ''
  });

  // 🔥 Đổ dữ liệu từ Redux vào form khi component được mount hoặc khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || '',
        // Nếu user có _id thì lấy 6 số cuối của _id làm mã nhân sự mô phỏng (tùy ý bạn)
        employeeId: user._id ? user._id.slice(-6).toUpperCase() : 'N/A', 
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Đang lưu thay đổi:', formData);
    // Sau này bạn gọi API ở đây: await api.put('/users/update', formData)
    // Sau khi cập nhật thành công, có thể dispatch action để update lại Redux store
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      // 🔥 1. Ngắt kết nối Socket của Dispatcher trước
      if (socket && socket.connected) {
          socket.disconnect();
          console.log("Đã ngắt Socket của Dispatcher để dọn dẹp phiên làm việc cũ.");
      }

      // 2. Gọi API đăng xuất
      await api.get("auth/logout");
      
      // 3. Xóa Redux và Local Storage
      dispatch(logout());
      
      // 4. Bay về trang login
      navigate("/login");
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    }
  };

  if (!user) return null; // Không render nếu chưa có user

  return (
    <section className="flex-1 p-8 bg-white rounded-xl border border-gray-200 shadow-sm max-md:p-5 animate-in fade-in duration-300">
      <h2 className="mb-8 text-xl font-bold text-gray-900">
        Hồ sơ điều phối viên
      </h2>

      <div className="flex gap-6 items-start mb-8 max-md:flex-col max-md:items-center">
        <img
          src="https://placehold.co/120x120/d1d5db/d1d5db"
          alt="Avatar"
          className="w-[120px] h-[120px] rounded-full object-cover"
        />
        <div className="flex-1 max-md:text-center mt-2">
          <button className="mb-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-200 transition-colors">
            Đổi ảnh đại diện
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Hỗ trợ định dạng JPG, PNG. Tối đa 2MB.
          </p>
        </div>
      </div>

      <form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="mb-2 text-sm font-semibold text-gray-900 block">Họ và tên</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 text-sm font-semibold text-gray-900 block">Mã nhân sự</label>
            <input
              type="text"
              value={formData.employeeId}
              disabled
              className="px-4 py-3 w-full text-sm text-gray-500 bg-gray-100 rounded-lg border border-gray-300 cursor-not-allowed font-mono uppercase tracking-wider"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="mb-2 text-sm font-semibold text-gray-900 block">Số điện thoại</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 text-sm font-semibold text-gray-900 block">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="px-4 py-3 w-full text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100">
          
          {/* Nút Đăng xuất */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center px-6 py-2.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Đăng xuất
          </button>

          {/* Nút Lưu thay đổi */}
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Lưu thay đổi
          </button>
          
        </div>
      </form>
    </section>
  );
};