import React, { useState } from "react";
import { AdminMenu } from "../../components/Admin/Menu";
import { AdminHeader } from "../../components/Admin/AdminHeader"; 
import { Plus, Filter, Edit, Trash2, Search, ShieldCheck, User, X } from "lucide-react";
import AddAccountForm from "../../components/Admin/AddAccountForm"; 

// MOCK DATA
const initialUsers = [
  { id: "U001", name: "Trần Minh Quân", email: "quan.tm@admin.com", role: "ĐIỀU PHỐI VIÊN", lastLogin: "2 phút trước", status: "Hoạt động", avatar: "https://i.pravatar.cc/150?img=33" },
  { id: "U002", name: "Nguyễn Thị Hà", email: "ha.nguyen@admin.com", role: "ĐIỀU PHỐI VIÊN", lastLogin: "1 giờ trước", status: "Hoạt động", avatar: "https://i.pravatar.cc/150?img=47" },
  { id: "U003", name: "Lê Văn Tiến", email: "tienle@gmail.com", role: "NGƯỜI DÂN", lastLogin: "Hôm qua", status: "Hoạt động", avatar: "https://i.pravatar.cc/150?img=11" },
];

export const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState(initialUsers);

  const handleCreateAccount = (formData) => {
    const newUser = {
      id: `U00${users.length + 1}`,
      name: formData.fullName,
      email: formData.email,
      role: formData.role === "admin" ? "QUẢN TRỊ VIÊN" : "ĐIỀU PHỐI VIÊN",
      lastLogin: "Vừa xong",
      status: "Hoạt động",
      avatar: `https://i.pravatar.cc/150?u=${formData.email}`
    };
    setUsers([newUser, ...users]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <AdminMenu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdminHeader 
          title="Quản lý người dùng và ĐPV" 
          subtitle="Báo cáo hệ thống" 
          onExport={() => alert("Đang xuất file...")}
        />
        
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col mt-2 min-h-[500px]">
            {/* Toolbar */}
            <div className="p-5 flex justify-between items-center gap-4">
              <div className="flex-1 max-w-md relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-full text-[15px] focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200"><Filter size={20}/></button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0088FF] hover:bg-blue-600 text-white rounded-lg font-bold text-[15px] shadow-md active:scale-95 transition-all"
                >
                  <Plus size={18} /> Thêm tài khoản Admin/DPV
                </button>
              </div>
            </div>

            {/* Bảng Dữ Liệu */}
            <div className="overflow-x-auto border-t border-gray-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4">Tài khoản</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4">Đăng nhập lần cuối</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-[15px]">{user.name}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold w-fit ${user.role === 'NGƯỜI DÂN' ? 'bg-gray-100 text-gray-600' : 'bg-purple-50 text-purple-700'}`}>
                            {user.role === 'NGƯỜI DÂN' ? <User size={12}/> : <ShieldCheck size={12}/>}
                            {user.role}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">{user.lastLogin}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.status === 'Hoạt động' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                           <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                           <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL THÊM TÀI KHOẢN (Đè lên trên) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Lớp nền xám mờ */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
              onClick={() => setIsModalOpen(false)} 
            />
            {/* Nội dung Form */}
            <div className="relative w-full max-w-[570px] animate-in zoom-in duration-300">
              <AddAccountForm 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleCreateAccount} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};