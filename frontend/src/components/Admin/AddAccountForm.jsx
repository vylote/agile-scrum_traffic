import React, { useState } from "react";

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
const RoleOption = ({  value, icon, title, description, selected, onChange }) => (
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
        <i className={`ti ${icon} ${selected ? "text-blue-600" : "text-gray-400"}`} />
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-[11px] leading-relaxed text-gray-500">{description}</p>
    </div>
  </div>
);

const AddAccountForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "cuuho123",
    role: "coordinator",
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Thêm tài khoản nội bộ</h1>
          <p className="text-sm text-gray-500 mt-1">Phân quyền nhân sự vận hành hệ thống.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <i className="ti ti-x text-2xl text-gray-400" />
        </button>
      </header>

      {/* Form Content */}
      <div className="p-8">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
          <FormField label="Họ và tên" required>
            <input
              type="text"
              placeholder="Nhập tên nhân sự"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="w-full h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Số điện thoại" required>
              <input
                type="tel"
                placeholder="09988..."
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                required
              />
            </FormField>
            <FormField label="Email nội bộ" required>
              <input
                type="email"
                placeholder="@cuuho.vn"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                required
              />
            </FormField>
          </div>

          <FormField label="Phân quyền hệ thống" required>
            <div className="grid grid-cols-2 gap-4">
              <RoleOption
                id="coordinator"
                value="coordinator"
                icon="ti-headset"
                title="Điều phối viên"
                description="Trực tổng đài, tiếp nhận sự cố và điều xe cứu hộ."
                selected={formData.role === "coordinator"}
                onChange={(val) => handleInputChange("role", val)}
              />
              <RoleOption
                id="admin"
                value="admin"
                icon="ti-shield-lock"
                title="Quản trị viên"
                description="Toàn quyền hệ thống, quản lý đối tác và xem báo cáo."
                selected={formData.role === "admin"}
                onChange={(val) => handleInputChange("role", val)}
              />
            </div>
          </FormField>

          <FormField label="Mật khẩu tạm thời" required helpText="Người dùng sẽ phải đổi mật khẩu ở lần đăng nhập đầu tiên.">
            <input
              type="text"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full h-11 px-4 text-sm bg-gray-100 border border-gray-200 rounded-xl font-mono text-gray-600 outline-none"
            />
          </FormField>

          <footer className="flex gap-3 justify-end mt-8">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              className="px-8 py-2.5 bg-[#0088FF] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all"
            >
              Đẩy lên hệ thống
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddAccountForm;