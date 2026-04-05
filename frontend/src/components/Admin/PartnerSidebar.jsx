import React, { useState } from "react";
import { 
  X, Phone, MapPin, Briefcase, Users, 
  FileCheck, Info, Plus, Trash2, ChevronDown, 
  CheckCircle2, UserPlus, Save 
} from "lucide-react";

// --- CÁC THÀNH PHẦN UI HỖ TRỢ (Lắp ráp từ snippet của bạn) ---

const FormField = ({ label, required = false, children, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    <label className="mb-2 text-sm font-medium leading-5 text-gray-900 block">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const SelectField = ({ value, onChange, options = [], className = "" }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`px-3 py-2.5 w-full h-11 text-sm leading-5 text-gray-900 bg-white rounded-md border border-gray-300 cursor-pointer appearance-none focus:ring-2 focus:ring-blue-500 outline-none ${className}`}
    >
      <option value="" disabled>Chọn vai trò</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

// --- MODAL THÊM NHÂN SỰ (Cửa sổ Pop-up) ---

const AddPersonnelModal = ({ isOpen, onClose, teamName }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    role: "lai-chinh",
    defaultPassword: "cuuho123"
  });

  if (!isOpen) return null;

  const roleOptions = [
    { value: "lai-chinh", label: "Lái chính" },
    { value: "lai-phu", label: "Lái phụ" },
    { value: "nhan-vien", label: "Nhân viên" }
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Lớp nền mờ tối hơn cho riêng Modal này */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <header className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Thêm nhân sự mới</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </header>

        <form className="p-6" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <section className="mb-6">
            <p className="text-sm text-gray-500">
              Thêm vào đội: <span className="text-blue-500 font-bold ml-1">{teamName}</span>
            </p>
          </section>

          <FormField label="Họ và tên" required>
            <input
              type="text"
              placeholder="Nhập tên nhân sự"
              className="px-3 py-2.5 w-full h-11 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="Số điện thoại" required>
              <input
                type="tel"
                placeholder="02131..."
                className="px-3 py-2.5 w-full h-11 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </FormField>

            <FormField label="Vai trò trong đội" required>
              <SelectField
                value={formData.role}
                onChange={(val) => setFormData({...formData, role: val})}
                options={roleOptions}
              />
            </FormField>
          </div>

          <FormField label="Mật khẩu mặc định">
            <input
              type="text"
              value={formData.defaultPassword}
              className="px-3 py-2.5 w-full h-11 text-sm bg-gray-50 rounded-md border border-gray-300 text-gray-500 font-mono"
              readOnly
            />
          </FormField>

          <p className="mb-8 text-xs text-gray-400 italic">
            * Tài xế có thể đổi mật khẩu này trong Cài đặt của App Mobile.
          </p>

          <footer className="flex gap-3 justify-end items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              Đẩy lên hệ thống
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH PARTNER SIDEBAR ---

export const PartnerSidebar = ({ partner, onClose }) => {
  const [activeTab, setActiveTab] = useState("organization");
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);

  if (!partner) return null;

  const staffMembers = [
    { id: "101", name: "Nguyễn Văn Lái", phone: "0987654567", role: "Lái chính", status: "online" },
    { id: "102", name: "Trần Văn Phụ", phone: "0987654321", role: "Phụ xe", status: "online" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Lớp nền mờ cho Sidebar */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity" onClick={onClose} />

      {/* Sidebar Content */}
      <aside className="relative w-full max-w-[420px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <header className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <div className="flex gap-3 items-center">
            <img
              src={partner.avatar || "https://placehold.co/40x40/d1d5db/d1d5db"}
              alt="Team avatar"
              className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-sm"
            />
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">{partner.name}</h2>
              <p className="text-xs text-gray-400 font-medium">Mã: {partner.id}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <span className="px-3 py-1 text-[11px] font-bold uppercase text-emerald-700 bg-emerald-100 rounded-md border border-emerald-200">
              {partner.status || "Đang hoạt động"}
            </span>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* TAB NAVIGATION */}
        <nav className="flex px-6 border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab("organization")}
            className={`flex gap-2 items-center px-4 py-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === "organization" ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            <Info size={16} /> Thông tin tổ chức
          </button>
          <button
            onClick={() => setActiveTab("personnel")}
            className={`flex gap-2 items-center px-4 py-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === "personnel" ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            <Users size={16} /> Quản lý nhân sự
          </button>
        </nav>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "organization" ? (
            /* TAB 1: THÔNG TIN TỔ CHỨC */
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hồ sơ Doanh nghiệp</h3>
              
              <div className="space-y-4">
                <FormField label="Tên doanh nghiệp">
                  <input
                    type="text"
                    defaultValue={partner.name}
                    className="px-4 py-2.5 w-full text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </FormField>

                <FormField label="Hotline liên hệ">
                  <input
                    type="tel"
                    defaultValue={partner.phone}
                    className="px-4 py-2.5 w-full text-sm font-semibold rounded-xl border border-gray-200"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Khu vực phụ trách">
                    <div className="relative">
                      <select className="px-4 py-2.5 w-full text-sm bg-white rounded-xl border border-gray-200 outline-none appearance-none">
                        <option>Cầu Giấy</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                  </FormField>
                  <FormField label="Năng lực chính">
                    <div className="relative">
                      <select className="px-4 py-2.5 w-full text-sm bg-white rounded-xl border border-gray-200 outline-none appearance-none">
                        <option>Xe Cẩu Kéo / Sàn Trượt</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400" />
                    </div>
                  </FormField>
                </div>

                <div className="pt-4 border-t border-dashed border-gray-200">
                  <h4 className="mb-3 text-sm font-bold text-gray-900 uppercase">Giấy phép ĐKKD</h4>
                  <div className="flex items-center p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 justify-between">
                    <div className="flex gap-2 items-center">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-700 uppercase">Đã xác thực hồ sơ</span>
                    </div>
                    <button className="px-3 py-1.5 text-[10px] font-bold text-gray-500 bg-white rounded-lg border border-gray-200">
                      Xem lại đơn
                    </button>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]">
                Lưu cập nhật hồ sơ
              </button>
            </div>
          ) : (
            /* TAB 2: QUẢN LÝ NHÂN SỰ */
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Nhân sự</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">2</span>
                </div>
                {/* NÚT MỞ MODAL THÊM NHÂN SỰ */}
                <button 
                  onClick={() => setIsPersonnelModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-md shadow-sky-100"
                >
                  <Plus size={14} /> Thêm nhân sự
                </button>
              </div>

              {/* List */}
              <div className="space-y-3">
                {staffMembers.map((staff, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 transition-all shadow-sm group">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={`https://i.pravatar.cc/150?img=${idx+20}`} className="w-10 h-10 rounded-full border border-gray-100 shadow-sm" alt="" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{staff.name}</p>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-tighter">
                          {staff.role} • {staff.phone}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100 border-opacity-50 mt-10">
                <Info size={18} className="text-sky-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-sky-700 leading-relaxed font-medium italic">
                  Hệ thống <b>Auto-Assign</b> sẽ quét GPS của các tài xế đang ở trạng thái Online để điều phối sự cố gần nhất.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MODAL PHỤ ĐÈ LÊN SIDEBAR */}
        <AddPersonnelModal 
          isOpen={isPersonnelModalOpen} 
          onClose={() => setIsPersonnelModalOpen(false)}
          teamName={partner.name}
        />
      </aside>
    </div>
  );
};