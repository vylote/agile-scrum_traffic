import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import Map from '../components/Map';
import { logout } from "../store/slices/authSlice";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);

  // Tính toán vị trí fixed cho dropdown dựa trên vị trí avatar
  const handleAvatarClick = () => {
    if (!dropdownOpen && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,           // ngay dưới avatar + gap 8px
        right: window.innerWidth - rect.right, // căn phải theo avatar
      });
    }
    setDropdownOpen((prev) => !prev);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        avatarRef.current && !avatarRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setDropdownOpen(false);
    navigate("/");
  };

  const handleSettings = () => {
    setDropdownOpen(false);
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center pb-[85px]">
      <div className="w-full max-w-md relative flex flex-col pt-[23px]">

        {/* Status bar */}
        <div className="flex justify-between items-center mb-[39px] px-[24px]">
          <span className="text-black text-[17px] font-semibold">9:41</span>
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/oys9en11_expires_30_days.png"
            className="w-[95px] h-[22px] object-fill"
            alt="status"
          />
        </div>

        {/* --- TITLE & AVATAR --- */}
        <div className="flex justify-between items-center mb-[29px] px-[25px]">
          <span className="text-black text-[34px] font-bold">
            Cứu hộ giao thông
          </span>

          {user ? (
            <button
              ref={avatarRef}
              onClick={handleAvatarClick}
              className="w-10 h-10 bg-[#0088FF] text-white rounded-full flex items-center justify-center font-bold text-xl shadow-sm border-2 border-white active:scale-95 transition-transform flex-shrink-0"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-10 h-10 bg-white text-[#0088FF] rounded-full flex items-center justify-center font-bold shadow-sm flex-shrink-0"
            >
              👤
            </button>
          )}
        </div>

        {/* --- NẾU CHƯA ĐĂNG NHẬP: HIỆN CẢNH BÁO --- */}
        {!user && (
          <div className="px-[25px] mb-5">
            <div
              onClick={() => navigate('/login')}
              className="bg-[#0088FF] text-white p-4 rounded-[20px] flex items-center justify-between cursor-pointer shadow-md active:scale-95 transition-transform"
            >
              <div className="flex flex-col">
                <span className="font-bold text-[17px]">Bạn chưa đăng nhập</span>
                <span className="text-[13px] opacity-80">Đăng nhập để sử dụng tính năng báo cáo</span>
              </div>
              <span className="text-2xl">›</span>
            </div>
          </div>
        )}

        {/* --- 2 CARD CHỨC NĂNG --- */}
        <div className="px-[25px]">

          {/* Card SOS */}
          <Link
            to={user ? "/sos" : "/login"}
            className={`flex items-center bg-white py-[13px] px-5 mb-2.5 rounded-[27px] shadow-sm transition-transform ${user ? 'active:scale-95 cursor-pointer hover:shadow-md' : 'opacity-60 grayscale cursor-not-allowed'}`}
          >
            <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/yhu0itn4_expires_30_days.png" className="w-8 h-8 mr-5 object-fill" alt="sos" />
            <div className="flex flex-1 flex-col items-start mr-9">
              <span className="text-[#FF3B30] text-xl font-medium">SOS Khẩn cấp</span>
              <span className="text-[#8E8E93] text-sm">Tự động gửi vị trí ngay lập tức</span>
            </div>
            <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/x3m381ip_expires_30_days.png" className="w-5 h-5 object-fill" alt="arrow" />
          </Link>

          {/* Card Báo cáo */}
          <Link
            to={user ? "/report" : "/login"}
            className={`flex items-center bg-white py-[13px] px-5 mb-5 rounded-[27px] shadow-sm transition-transform ${user ? 'active:scale-95 cursor-pointer hover:shadow-md' : 'opacity-60 grayscale cursor-not-allowed'}`}
          >
            <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/0zcy6aau_expires_30_days.png" className="w-8 h-8 mr-5 object-fill" alt="report" />
            <div className="flex flex-col flex-1 shrink-0 items-start">
              <span className="text-black text-xl font-medium">Báo cáo chi tiết</span>
              <span className="text-[#8E8E93] text-sm mr-3">Mô tả sự cố chi tiết</span>
            </div>
            <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/2cwnlttk_expires_30_days.png" className="w-5 h-5 object-fill" alt="arrow" />
          </Link>
        </div>

        {/* --- KHU VỰC BẢN ĐỒ --- */}
        <span className="text-black text-[22px] font-bold mb-2.5 ml-[25px]">
          Bản đồ khu vực
        </span>

        <div className="px-[25px] flex flex-col gap-3 relative">
          <div className="absolute top-4 left-[35px] z-10 flex items-center bg-white/90 backdrop-blur-sm py-[9px] px-4 gap-[7px] rounded-[27px] shadow-sm">
            <div className="w-2 h-2 bg-[#34C759] rounded-full animate-pulse"></div>
            <span className="text-black text-[15px] font-medium">
              Có 1 đội cứu hộ gần bạn
            </span>
          </div>

          <div className="w-full h-[350px] rounded-[27px] overflow-hidden border-2 border-white shadow-sm relative z-0">
            <Map />
          </div>
        </div>

      </div>

      {/* --- DROPDOWN MENU (fixed, tọa độ tuyệt đối) --- */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
          className="fixed w-[200px] bg-white rounded-[18px] shadow-2xl border border-[#E5E5EA] overflow-hidden z-[100]"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-[#F2F2F7]">
            <p className="text-black font-semibold text-[14px] truncate">{user.name}</p>
            <p className="text-[#8E8E93] text-[12px] truncate">{user.email || "Tài khoản của bạn"}</p>
          </div>

          {/* Settings */}
          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F2F2F7] active:bg-[#E5E5EA] transition-colors border-b border-[#F2F2F7]"
          >
            <span className="text-[18px]">⚙️</span>
            <span className="text-black text-[15px] font-medium">Cài đặt</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF1F0] active:bg-[#FFE0DE] transition-colors"
          >
            <span className="text-[18px]">🚪</span>
            <span className="text-[#FF3B30] text-[15px] font-medium">Đăng xuất</span>
          </button>
        </div>
      )}

      {/* --- BOTTOM TAB BAR --- */}
      <div className="fixed bottom-0 w-full max-w-md h-[85px] bg-[#F2F2F7]/90 backdrop-blur-md border-t border-[#E5E5EA] flex justify-around items-center px-4 z-50">

        <button className="flex flex-col items-center bg-[#EDEDED] py-1.5 px-6 rounded-[100px]" onClick={() => navigate("/")}>
          <span className="text-[22px] mb-1">🏠</span>
          <span className="text-[#0088FF] text-[10px] font-medium">Trang chủ</span>
        </button>

        <button className="flex flex-col items-center" onClick={() => navigate("/history")}>
          <span className="text-[22px] mb-1">📋</span>
          <span className="text-[#1A1A1A] text-[10px] font-medium">Lịch sử</span>
        </button>

        <button className="flex flex-col items-center relative" onClick={() => navigate("/notifications")}>
          <span className="text-[22px] mb-1">🔔</span>
          <span className="text-[#1A1A1A] text-[10px] font-medium">Thông báo</span>
          <div className="absolute top-0 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
        </button>

      </div>
    </div>
  );
};

export default Home;