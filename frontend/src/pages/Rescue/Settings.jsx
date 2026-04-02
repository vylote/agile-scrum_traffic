import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Truck, AlertTriangle, Settings as SettingsIcon, ChevronRight } from 'lucide-react';

import api from "../../services/api";
import { logout } from "../../store/slices/authSlice";
import StatusBar from "../../components/RescueTeam/StatusBar";
import TabBar from "../../components/RescueTeam/TabBar";

const UserProfile = ({ name = "Nguyễn Văn A", employeeId = "0001", avatarUrl = "https://api.builder.io/api/v1/image/assets/TEMP/0652c9b603670ade7b0ce94bb139afeed3874bbd" }) => (
  <section className="flex flex-col items-center pt-8 pb-4">
    <img
      src={avatarUrl}
      className="object-cover w-20 h-20 rounded-full border-4 border-white shadow-md"
      alt="Profile"
    />
    <h1 className="mt-3 text-[22px] font-bold tracking-tight text-gray-900">
      {name}
    </h1>
    <p className="mt-1 text-sm font-medium text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
      Mã NV: {employeeId}
    </p>
  </section>
);

const AccountHeader = () => (
  <header className="flex justify-between items-center pl-8 pr-4 bg-white rounded-t-[27px] pt-2">
    <h1 className="text-xl font-bold text-gray-900">
      Tài khoản & Cài đặt
    </h1>
    <img
      src="https://api.builder.io/api/v1/image/assets/TEMP/1596b8501431a13b5f4bb544100083ec58f60ee1"
      className="object-contain w-[88px] h-auto"
      alt="Settings illustration"
      onClick={useNavigate("/dashboard")}
    />
  </header>
);

const MenuItem = ({label, onClick, hasBorder = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full bg-white px-5 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100 ${
      hasBorder ? 'border-b border-gray-100' : ''
    }`}
  >
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
        
      </div>
      <span className="text-[17px] font-medium text-gray-900">
        {label}
      </span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-300" />
  </button>
);

export const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await api.get("auth/logout");
      dispatch(logout());
      navigate("/login"); 
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    } 
  };

  return (
    // Dùng h-screen để khóa chiều cao, tránh tràn màn hình
    <div className="relative mx-auto w-full h-screen max-w-[480px] bg-[#F5F6FA] overflow-hidden flex flex-col shadow-2xl">
      
      <StatusBar time="11:30" />

      {/* Khu vực nội dung cuộn */}
      <main className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
        
        {/* Avatar */}
        <UserProfile />

        {/* Khối nền trắng chứa Menu */}
        <div className="flex-1 bg-white mt-2 rounded-t-[27px] shadow-[0_-4px_24px_rgba(0,0,0,0.02)] flex flex-col">
          
          <AccountHeader />

          <div className="px-5 pt-4 pb-8 flex flex-col">
            {/* Nhóm: Thông tin phương tiện */}
            <div className="mb-6">
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">
                Thông tin phương tiện
              </h3>
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
                <MenuItem 
                  icon={Truck} 
                  label="Phương tiện của tôi" 
                  hasBorder={true}
                  onClick={() => console.log('Phương tiện của tôi')} 
                />
                <MenuItem 
                  icon={AlertTriangle} 
                  label="Loại xe cứu hộ" 
                  onClick={() => console.log('Loại xe cứu hộ')} 
                />
              </div>
            </div>

            {/* Nhóm: Ứng dụng */}
            <div className="mb-6">
              <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">
                Ứng dụng
              </h3>
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
                <MenuItem 
                  icon={SettingsIcon} 
                  label="Cài đặt hệ thống" 
                  onClick={() => console.log('Cài đặt hệ thống')} 
                />
              </div>
            </div>

            {/* Nút Đăng xuất theo thiết kế mới */}
            <button
              onClick={handleLogout}
              className="w-full mt-2 py-4 flex items-center justify-center text-[17px] tracking-tight font-bold text-red-500 bg-[#E5E5EA] bg-opacity-60 rounded-xl hover:bg-opacity-80 transition-colors active:scale-95"
            >
              Đăng xuất
            </button>
          </div>

        </div>
      </main>

      {/* TabBar (Tự động bám đáy) */}
      <div className="bg-white shrink-0">
        <TabBar activeTab="none" /> 
      </div>

    </div>
  );
};

export default Settings;