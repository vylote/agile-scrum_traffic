"use client";
import React, { useState } from "react";
import { AdminMenu } from "../../components/Admin/Menu";
import { AdminHeader } from "../../components/Admin/AdminHeader";
import { PartnerSidebar } from "../../components/Admin/PartnerSidebar";
import { Plus, Filter, Edit, Trash2, Info, X, MoreVertical } from "lucide-react";

// --- CÁC THÀNH PHẦN FORM (Đã sửa lỗi Impure Function) ---

const FormField = ({ label, required = false, children }) => (
  <div className="mb-4">
    <div className="flex gap-1 items-center mb-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {required && <span className="text-red-500">*</span>}
    </div>
    {children}
  </div>
);

const SelectField = ({ children }) => (
  <div className="relative">
    <select className="px-3 py-2 w-full h-10 text-sm text-gray-900 bg-white rounded-md border border-gray-300 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
      {children}
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
       <MoreVertical size={14} className="rotate-90"/>
    </div>
  </div>
);

const AddPartnerModal = ({ isOpen, onClose, onAdd }) => {
  // SỬA LỖI: Dùng functional initializer để hàm Math.random chỉ chạy 1 lần khi mount
  const [formData, setFormData] = useState(() => ({
    businessName: '',
    teamCode: `RT-${Math.floor(1000 + Math.random() * 9000)}`,
    hotline: '',
    area: 'Cầu Giấy',
    capability: 'Xe Cẩu Kéo / Sàn Trượt'
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[570px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">Thêm đối tác cứu hộ mới</h1>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-500" /></button>
          </header>

          <form onSubmit={(e) => { e.preventDefault(); onAdd(formData); }}>
            <p className="mb-6 text-sm text-gray-500">Nhập thông tin cơ bản để tạo hồ sơ cứu hộ mới trên hệ thống.</p>
            <FormField label="Tên doanh nghiệp / Trung tâm cứu hộ" required>
              <input type="text" placeholder="VD: Gara Ô tô Thành Đạt" className="px-3 py-2 w-full h-10 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
            </FormField>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Mã đội"><input type="text" className="px-3 py-2 w-full h-10 text-sm rounded-md border border-gray-100 bg-gray-50 font-mono" readOnly value={formData.teamCode} /></FormField>
              <FormField label="Hotline" required><input type="tel" placeholder="0912xx..." className="px-3 py-2 w-full h-10 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required value={formData.hotline} onChange={(e) => setFormData({...formData, hotline: e.target.value})} /></FormField>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Khu vực" required><SelectField><option value="Cầu Giấy">Cầu Giấy</option></SelectField></FormField>
              <FormField label="Năng lực" required><SelectField><option value="Xe Cẩu Kéo / Sàn Trượt">Xe Cẩu Kéo / Sàn Trượt</option></SelectField></FormField>
            </div>

            <div className="flex gap-3 items-start p-3 mb-8 bg-blue-50 rounded-lg border border-blue-100">
              <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">Hồ sơ đối tác sẽ được tạo ở trạng thái <b>Chờ duyệt</b>.</p>
            </div>

            <div className="flex gap-3 justify-end items-center">
              <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Hủy bỏ</button>
              <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-[#0088FF] hover:bg-blue-600 rounded-lg shadow-md active:scale-95 transition-all">Đẩy lên hệ thống</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- TRANG CHÍNH ---

export const Partners = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null); // Quản lý Sidebar
  
  const [partners, setPartners] = useState([
    { id: "0001", name: "Đội cứu hộ 1", phone: "0123456789", type: "Xe sàn trượt", status: "Hoạt động", avatar: "https://i.pravatar.cc/150?img=11" },
    { id: "0002", name: "Đội cứu hộ 2", phone: "0987654321", type: "Xe cẩu kéo", status: "Hoạt động", avatar: "https://i.pravatar.cc/150?img=12" },
  ]);

  const handleAddNewPartner = (formData) => {
    const newPartner = {
      id: formData.teamCode,
      name: formData.businessName,
      phone: formData.hotline,
      type: formData.capability,
      status: "Tạm nghỉ",
      avatar: `https://i.pravatar.cc/150?u=${formData.teamCode}`
    };
    setPartners([newPartner, ...partners]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <AdminMenu />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdminHeader title="Đối tác cứu hộ" subtitle="Quản lý mạng lưới xe và tài xế" />
        
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col mt-2 overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Tất cả đối tác ({partners.length})</h3>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold border border-gray-200"><Filter size={16} /> Lọc</button>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0088FF] text-white rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all"><Plus size={16} /> Thêm đối tác</button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Mã Đội</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Đối tác</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Liên hệ</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {partners.map((partner) => (
                    <tr 
                      key={partner.id} 
                      onClick={() => setSelectedPartner(partner)} // CLICK ĐỂ MỞ SIDEBAR
                      className="hover:bg-blue-50/40 cursor-pointer transition-all group"
                    >
                      <td className="px-6 py-4 font-bold text-gray-400 font-mono">{partner.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={partner.avatar} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                          <span className="font-bold text-gray-900">{partner.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{partner.phone}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
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

        {/* SIDEBAR CHI TIẾT */}
        <PartnerSidebar 
          partner={selectedPartner} 
          onClose={() => setSelectedPartner(null)} 
        />

        {/* MODAL THÊM MỚI */}
        <AddPartnerModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddNewPartner}
        />
      </main>
    </div>
  );
};