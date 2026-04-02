import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {X,Car,PhoneCall,Bell,ShieldCheck,LogOut,ChevronRight} from "lucide-react";
import ellipse1 from "../../assets/images/avatar.jpg"; 
import api from "../../services/api";
import { logout } from "../../store/slices/authSlice";

export const CitizenAccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async (e) => {
      e.preventDefault()
      try {
        await api.get("auth/logout")
        dispatch(logout())
        // setTimeout(() => {
        //   navigate("/login");
        // }, 2000);
        navigate("/login")
      } catch (err) {
        console.error("loi dang xuat: ",err)
      } 
    }

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] font-sans pb-10">
      {/* 1. STATUS BAR */}
      <div className="flex justify-between items-center px-8 pt-5 pb-2">
        <span className="text-black font-bold text-[17px]">9:41</span>
        <img
          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/rVIdi7n1RR/hncc5whw_expires_30_days.png"
          className="w-[95px] h-[22px] object-contain"
          alt="status icons"
        />
      </div>

      {/* 2. HEADER & NÚT ĐÓNG */}
      <div className="flex justify-between items-center px-6 mt-4 mb-6">
        <h1 className="text-[28px] font-bold text-black tracking-tight">
          Tài khoản & Cài đặt
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 bg-gray-200/80 rounded-full flex items-center justify-center text-gray-600 active:scale-90 transition-transform"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 3. PROFILE INFO (Avatar & Tên) */}
      <div className="flex flex-col items-center justify-center mb-8 mt-2">
        <div className="relative">
          <img
            src={ellipse1}
            alt="User Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
          />
          {/* Dấu chấm xanh online (tùy chọn) */}
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-[3px] border-white rounded-full"></div>
        </div>
        <h2 className="text-[22px] font-bold text-black mt-3">Nguyễn Văn A</h2>
        <span className="text-[15px] text-gray-500 font-medium mt-0.5">
          0912 345 678
        </span>
      </div>

      <div className="px-6 space-y-6">
        {/* GROUP 1: THÔNG TIN CỨU HỘ */}
        <section>
          <h3 className="text-[#8E8E93] text-[13px] font-bold uppercase ml-4 mb-2">
            Thông tin cứu hộ
          </h3>
          <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100">
            {/* Item 1: Phương tiện của tôi */}
            <button className="w-full flex items-center px-4 py-3.5 bg-white active:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                <Car className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left text-[17px] font-medium text-black">
                Phương tiện của tôi
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            {/* Item 2: Liên hệ khẩn cấp */}
            <button className="w-full flex items-center px-4 py-3.5 bg-white active:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mr-4">
                <PhoneCall className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left text-[17px] font-medium text-black">
                Liên hệ khẩn cấp
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </section>

        {/* GROUP 2: ỨNG DỤNG (Đã fix lỗi copy-paste của Designer) */}
        <section>
          <h3 className="text-[#8E8E93] text-[13px] font-bold uppercase ml-4 mb-2">
            Ứng dụng
          </h3>
          <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100">
            {/* Item 1: Cài đặt thông báo */}
            <button className="w-full flex items-center px-4 py-3.5 bg-white active:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mr-4">
                <Bell className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left text-[17px] font-medium text-black">
                Cài đặt thông báo
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            {/* Item 2: Chính sách bảo mật */}
            <button className="w-full flex items-center px-4 py-3.5 bg-white active:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center mr-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left text-[17px] font-medium text-black">
                Chính sách bảo mật
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </section>

        {/* GROUP 3: ĐĂNG XUẤT */}
        <section className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-4 bg-white rounded-[20px] shadow-sm border border-gray-100 active:bg-red-50 transition-colors text-red-600"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span className="text-[17px] font-bold">Đăng xuất</span>
          </button>
        </section>
      </div>
    </div>
  );
};
