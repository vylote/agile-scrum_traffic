import React, { useState } from "react";
import { USER_ROLES } from "../../utils/constants/userConstants";

// Sub-component: FormField
const FormField = ({ label, required, children, helpText }) => (
  <div className="mb-5 text-left">
    <div className="flex gap-1 items-center mb-2">
      <label className="text-sm font-bold text-gray-700">{label}</label>
      {required && <span className="text-red-500">*</span>}
    </div>
    {children}
    {helpText && <p className="mt-1.5 text-xs text-gray-500 italic">{helpText}</p>}
  </div>
);

// Sub-component: RoleOption
const RoleOption = ({ value, icon, title, description, selected, onChange }) => (
  <div
    className={`flex gap-3 items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
      selected ? "bg-blue-50 border-blue-500 shadow-sm" : "bg-white border-gray-200 border-solid hover:bg-gray-50"
    }`}
    onClick={() => onChange(value)}
  >
    <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${selected ? "border-blue-500" : "border-gray-300"}`}>
       {selected && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
    </div>
    <div className="flex-1 text-left">
      <div className="flex gap-2 items-center mb-1">
        <i className={`ti ${icon} text-lg ${selected ? "text-blue-600" : "text-gray-400"}`} />
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-[11px] leading-relaxed text-gray-500">{description}</p>
    </div>
  </div>
);

const AddAccountForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",          // Khớp với trường 'name' trong Schema
    username: "",      // Bắt buộc theo Schema
    phone: "",
    email: "",
    password: "cuuho123",
    role: USER_ROLES.DISPATCHER, // Mặc định là ĐPV
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gửi dữ liệu về trang Users.jsx để gọi API
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Header */}
      <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Cấp tài khoản vận hành</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">Khởi tạo nhân sự thực thi trên toàn hệ thống.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-gray-400">
          <i className="ti ti-x text-2xl" />
        </button>
      </header>

      {/* Form Content */}
      <div className="p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-5">
            <FormField label="Họ và tên nhân sự" required>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn A"
                className="w-full h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </FormField>

            <FormField label="Tên đăng nhập (Username)" required>
              <input
                type="text"
                placeholder="nva_cuuho"
                className="w-full h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-mono"
                required
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value.toLowerCase().replace(/\s/g, ""))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <FormField label="Số điện thoại" required>
              <input
                type="tel"
                placeholder="09xxx..."
                className="w-full h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </FormField>
            <FormField label="Email nội bộ" required>
              <input
                type="email"
                placeholder="nhansu@cuuho.vn"
                className="w-full h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Phân quyền vai trò" required>
            <div className="grid grid-cols-2 gap-4">
              <RoleOption
                value={USER_ROLES.DISPATCHER}
                icon="ti-headset"
                title="Điều phối viên"
                description="Trực tổng đài, tiếp nhận sự cố và điều xe cứu hộ trên bản đồ."
                selected={formData.role === USER_ROLES.DISPATCHER}
                onChange={(val) => handleInputChange("role", val)}
              />
              <RoleOption
                value={USER_ROLES.RESCUE}
                icon="ti-truck"
                title="Nhân viên cứu hộ"
                description="Thành viên trực tiếp lái xe, thực hiện cứu trợ tại hiện trường."
                selected={formData.role === USER_ROLES.RESCUE}
                onChange={(val) => handleInputChange("role", val)}
              />
            </div>
          </FormField>

          <FormField label="Mật khẩu khởi tạo" required helpText="Gửi mật khẩu này cho nhân sự để họ đăng nhập lần đầu.">
            <input
              type="text"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full h-11 px-4 text-sm bg-blue-50/50 border border-blue-100 rounded-xl font-mono text-blue-600 outline-none"
            />
          </FormField>

          <footer className="flex gap-3 justify-end mt-10 pt-6 border-t border-gray-50">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              className="px-10 py-2.5 bg-[#0088FF] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-600 active:scale-95 transition-all"
            >
              Cấp tài khoản ngay
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddAccountForm;