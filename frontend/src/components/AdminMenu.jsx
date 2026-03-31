import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ShieldPlus, FileText, Settings } from "lucide-react";

export const AdminMenu = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { path: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Tổng quan (Dashboard)" },
  ];

  const systemItems = [
    { path: "/admin/partners", icon: <ShieldPlus className="w-5 h-5" />, label: "Đối tác cứu hộ" },
    { path: "/admin/users", icon: <Users className="w-5 h-5" />, label: "Người dùng & ĐPV" },
    { path: "/admin/reports", icon: <FileText className="w-5 h-5" />, label: "Báo cáo & Xuất dữ liệu" },
  ];

  return (
    <aside className="w-[280px] h-screen bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 z-10">
      
      {/* NỬA TRÊN: Logo & Các mục Menu */}
      <div className="flex flex-col">
        {/* Logo */}
        <div className="h-[80px] flex items-center px-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Admin System</h1>
        </div>

        <div className="flex flex-col p-4">
          {/* Nhóm 1: Tổng quan */}
          <nav className="flex flex-col gap-2 mb-6">
            {menuItems.map((item, index) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gray-900 text-white font-bold" // Active của Admin dùng màu đen nhám cho ngầu
                      : "text-gray-500 hover:bg-gray-50 font-medium hover:text-gray-900"
                  }`}
                >
                  <div className={isActive ? "text-white" : "text-gray-400"}>{item.icon}</div>
                  <span className="text-[15px] whitespace-pre-line">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Nhóm 2: Quản lý hệ thống */}
          <div className="px-4 mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Quản lý hệ thống
            </span>
          </div>
          <nav className="flex flex-col gap-2">
            {systemItems.map((item, index) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gray-900 text-white font-bold"
                      : "text-gray-500 hover:bg-gray-50 font-medium hover:text-gray-900"
                  }`}
                >
                  <div className={isActive ? "text-white" : "text-gray-400"}>{item.icon}</div>
                  <span className="text-[15px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* NỬA DƯỚI: Route Cài đặt hệ thống (Thay cho User Profile) */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/admin/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            currentPath === "/admin/settings"
              ? "bg-gray-900 text-white font-bold"
              : "text-gray-700 hover:bg-gray-50 font-bold hover:text-gray-900"
          }`}
        >
          <Settings className={currentPath === "/admin/settings" ? "text-white" : "text-gray-500"} />
          <span className="text-[15px]">Cài đặt hệ thống</span>
        </Link>
      </div>

    </aside>
  );
};