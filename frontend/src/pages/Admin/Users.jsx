import React, { useState } from "react";
import { AdminMenu } from "../../components/AdminMenu";
import { ExportButton } from "../../components/ExportButton"; 
import ellipse1 from "../../assets/images/avatar.jpg";
import { Plus, Filter, MoreVertical, Edit, Trash2, Search, ShieldCheck, User } from "lucide-react";

// MOCK DATA: Danh sách Người dùng & ĐPV
const mockUsers = [
  {
    id: "U001",
    name: "Trần Minh Quân",
    email: "quan.tm@admin.com",
    role: "ĐIỀU PHỐI VIÊN",
    lastLogin: "2 phút trước",
    status: "Hoạt động",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: "U002",
    name: "Nguyễn Thị Hà",
    email: "ha.nguyen@admin.com",
    role: "ĐIỀU PHỐI VIÊN",
    lastLogin: "1 giờ trước",
    status: "Hoạt động",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "U003",
    name: "Lê Văn Tiến",
    email: "tienle@gmail.com",
    role: "NGƯỜI DÂN",
    lastLogin: "Hôm qua",
    status: "Hoạt động",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: "U004",
    name: "Phạm Hoàng Bách",
    email: "bach.ph@gmail.com",
    role: "NGƯỜI DÂN",
    lastLogin: "3 ngày trước",
    status: "Đã khóa",
    avatar: "https://i.pravatar.cc/150?img=59",
  },
  {
    id: "U005",
    name: "Đỗ Phương Thảo",
    email: "thao.do@admin.com",
    role: "ĐIỀU PHỐI VIÊN",
    lastLogin: "1 tuần trước",
    status: "Tạm ngưng",
    avatar: "https://i.pravatar.cc/150?img=20",
  }
];

export const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <AdminMenu />

      {/* 2. NỘI DUNG CHÍNH */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER CHUẨN ADMIN: Không SearchBar, Có ExportButton */}
        <header className="h-[90px] flex items-center justify-between px-8 bg-transparent shrink-0 mt-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-[26px] font-bold text-gray-900 leading-tight">
              Quản lý người dùng và ĐPV
            </h2>
            <p className="text-base text-gray-500 font-medium">
              Báo cáo hệ thống
            </p>
          </div>
          
          <div className="flex items-center gap-5">
            <ExportButton onClick={() => alert("Đang tải danh_sach_tai_khoan.csv ...")} />
            <img src={ellipse1} alt="Admin Profile" className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" />
          </div>
        </header>

        {/* KHU VỰC BẢNG DỮ LIỆU */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col mt-2 min-h-[500px]">
              
              {/* Toolbar: Tìm kiếm & Thêm ĐPV */}
              <div className="p-5 flex justify-between items-center gap-4">
                
                {/* Ô Search cục bộ dành riêng cho bảng */}
                <div className="flex-1 max-w-md relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Tìm theo tên, email, ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-full text-[15px] focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                    <Filter className="w-5 h-5" />
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0088FF] hover:bg-blue-600 text-white rounded-lg font-bold text-[15px] transition-colors shadow-sm active:scale-95">
                    <ShieldCheck className="w-5 h-5" />
                    Cấp quyền ĐPV mới
                  </button>
                </div>
              </div>

              {/* Bảng Dữ Liệu */}
              <div className="overflow-x-auto border-t border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tài khoản</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Đăng nhập lần cuối</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-gray-100">
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                        
                        {/* Cột Tài khoản (Avatar + Tên + Email) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-[15px]">{user.name}</span>
                              <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Cột Vai trò */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-md text-xs font-bold ${
                            user.role === "ĐIỀU PHỐI VIÊN" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            {user.role === "ĐIỀU PHỐI VIÊN" ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                            {user.role}
                          </div>
                        </td>

                        {/* Cột Đăng nhập */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600 font-medium text-sm">{user.lastLogin}</span>
                        </td>

                        {/* Cột Trạng thái */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            user.status === "Hoạt động" ? "bg-green-50 text-green-600 border-green-200" :
                            user.status === "Tạm ngưng" ? "bg-orange-50 text-orange-600 border-orange-200" :
                            "bg-red-50 text-red-600 border-red-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              user.status === "Hoạt động" ? "bg-green-500" :
                              user.status === "Tạm ngưng" ? "bg-orange-500" : "bg-red-500"
                            }`}></span>
                            {user.status}
                          </span>
                        </td>

                        {/* Cột Thao tác */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Khóa/Xóa">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

           </div>
        </div>

      </main>
    </div>
  );
};