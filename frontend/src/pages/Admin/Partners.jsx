import React from "react";
import { AdminMenu } from "../../components/AdminMenu";
import { ExportButton } from "../../components/ExportButton"; // 👈 Thêm Import nút Export
import ellipse1 from "../../assets/images/avatar.jpg"; // 👈 Thêm Import Avatar Admin
import { Plus, Filter, MoreVertical, Edit, Trash2 } from "lucide-react";

// MOCK DATA: Danh sách đối tác cứu hộ
const mockPartners = [
  {
    id: "0001",
    name: "Nguyễn Văn A",
    phone: "0123456789",
    type: "Xe sàn trượt",
    status: "Hoạt động",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: "0002",
    name: "Trần Văn B",
    phone: "0987654321",
    type: "Xe cẩu kéo",
    status: "Hoạt động",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "0003",
    name: "Lê Thị C",
    phone: "0345678901",
    type: "Sửa chữa lưu động",
    status: "Tạm nghỉ",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "0004",
    name: "Phạm Văn D",
    phone: "0912345678",
    type: "Xe sàn trượt",
    status: "Hoạt động",
    avatar: "https://i.pravatar.cc/150?img=14",
  },
  {
    id: "0005",
    name: "Hoàng Văn E",
    phone: "0888999777",
    type: "Xe cẩu kéo",
    status: "Khóa",
    avatar: "https://i.pravatar.cc/150?img=15",
  }
];

export const Partners = () => {
  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      
      {/* 1. SIDEBAR ADMIN */}
      <AdminMenu />

      {/* 2. NỘI DUNG CHÍNH */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER CHUẨN ADMIN: Có Export & Avatar */}
        <header className="h-[90px] flex items-center justify-between px-8 bg-transparent shrink-0 mt-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-[26px] font-bold text-gray-900 leading-tight">
              Đối tác cứu hộ
            </h2>
            <p className="text-base text-gray-500 font-medium">
              Quản lý danh sách xe và tài xế
            </p>
          </div>
          
          <div className="flex items-center gap-5">
            {/* 👈 Gọi nút Export Button dùng chung */}
            <ExportButton onClick={() => alert("Đang tải danh sách đối tác...")} />
            
            {/* Avatar Admin */}
            <img src={ellipse1} alt="Admin Profile" className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" />
          </div>
        </header>

        {/* KHU VỰC BẢNG DỮ LIỆU */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col mt-2">
            
            {/* Toolbar trên cùng của Bảng */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">
                Tất cả đối tác ({mockPartners.length})
              </h3>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm transition-colors border border-gray-200">
                  <Filter className="w-4 h-4" />
                  Lọc
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0088FF] hover:bg-blue-600 text-white rounded-lg font-bold text-sm transition-colors shadow-sm active:scale-95">
                  <Plus className="w-4 h-4" />
                  Thêm đối tác
                </button>
              </div>
            </div>

            {/* Bảng (Table) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                {/* Tiêu đề cột */}
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã NV</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Đối tác</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Loại xe</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                
                {/* Nội dung dữ liệu */}
                <tbody className="divide-y divide-gray-100">
                  {mockPartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50/80 transition-colors group">
                      
                      {/* Cột Mã NV */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900">{partner.id}</span>
                      </td>

                      {/* Cột Tên & Avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img 
                            src={partner.avatar} 
                            alt={partner.name} 
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                          <span className="font-bold text-gray-900 text-[15px]">{partner.name}</span>
                        </div>
                      </td>

                      {/* Cột SĐT */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 font-medium">{partner.phone}</span>
                      </td>

                      {/* Cột Loại xe */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">
                          {partner.type}
                        </span>
                      </td>

                      {/* Cột Trạng thái */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          partner.status === "Hoạt động" ? "bg-green-50 text-green-600 border-green-200" :
                          partner.status === "Tạm nghỉ" ? "bg-orange-50 text-orange-600 border-orange-200" :
                          "bg-red-50 text-red-600 border-red-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            partner.status === "Hoạt động" ? "bg-green-500" :
                            partner.status === "Tạm nghỉ" ? "bg-orange-500" : "bg-red-500"
                          }`}></span>
                          {partner.status}
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
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Phân trang (Pagination) - Mock UI */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50 rounded-b-2xl">
              <span>Hiển thị 1 đến 5 của 124 đối tác</span>
              <div className="flex gap-1">
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" disabled>Trước</button>
                <button className="px-3 py-1 border border-gray-200 rounded bg-gray-900 text-white font-bold">1</button>
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100">2</button>
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100">3</button>
                <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-100">Sau</button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};