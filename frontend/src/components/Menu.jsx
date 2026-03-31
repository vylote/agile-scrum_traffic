import { Link, useLocation } from "react-router-dom";
import { Map, AlertCircle, Truck, Phone, Settings } from "lucide-react";
// Nhớ giữ đúng đường dẫn avatar của bạn nhé
import ellipse1 from "../assets/images/avatar.jpg";

// ==========================================================
// 1. COMPONENT: UserProfile (Thông tin avatar Điều phối viên)
// ==========================================================
const UserProfile = () => {
  return (
    <footer className="p-6 border-t border-gray-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex items-center gap-3">
        <img
          src={ellipse1}
          alt="User avatar"
          className="object-cover shrink-0 w-10 h-10 rounded-full"
        />
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-gray-900">Điều phối viên A</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="text-xs text-gray-500 italic">Online</span>
          </div>
        </div>
      </div>
      <button aria-label="User menu" className="text-gray-400 hover:text-gray-600 transition-colors">
        <Settings className="w-5 h-5" />
      </button>
    </footer>
  );
};

// ==========================================================
// 2. COMPONENT: NavigationMenu (Danh sách link điều hướng)
// ==========================================================
const NavigationMenu = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { path: "/dispatcher/dashboard", icon: <Map className="w-5 h-5" />, label: "Bản đồ trực tiếp" },
    { path: "/dispatcher/incidents", icon: <AlertCircle className="w-5 h-5" />, label: "Sự cố", badge: 3 },
    { path: "/dispatcher/fleet", icon: <Truck className="w-5 h-5" />, label: "Quản lý đội xe" },
    { path: "/dispatcher/call-center", icon: <Phone className="w-5 h-5" />, label: "Liên lạc tổng đài" },
  ];

  return (
    <nav className="flex flex-col gap-2 p-4">
      {menuItems.map((item, index) => {
        const isActive = currentPath === item.path;

        return (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-blue-50 text-blue-600 font-bold" // Active giống mã màu mẫu của bạn
                : "text-gray-500 hover:bg-gray-50 font-medium hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={isActive ? "text-blue-600" : "text-gray-400"}>
                {item.icon}
              </div>
              <span className="text-[15px]">{item.label}</span>
            </div>

            {/* Chỉnh lại thẻ Badge cho giống với thiết kế trong mã nguồn của bạn */}
            {item.badge && (
              <div className="flex flex-col justify-center items-center px-2 font-bold text-white whitespace-nowrap bg-red-500 rounded-full h-[24px] min-w-[24px] text-xs">
                {item.badge}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

// ==========================================================
// 3. COMPONENT GỐC: Lắp ráp Sidebar hoàn chỉnh để export
// ==========================================================
export const Menu = () => {
  return (
    <aside className="w-[280px] h-screen bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 z-10">
      
      {/* Nửa trên: Logo + Danh sách menu */}
      <div className="flex flex-col">
        <div className="h-[80px] flex items-center px-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Cứu hộ.Web</h1>
        </div>
        <NavigationMenu />
      </div>

      {/* Nửa dưới: Profile Avatar */}
      <UserProfile />
      
    </aside>
  );
};