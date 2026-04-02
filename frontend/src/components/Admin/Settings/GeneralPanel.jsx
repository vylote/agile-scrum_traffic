import React, { useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';

// Nút Toggle Bật/Tắt (Dùng riêng cho màu đỏ cảnh báo)
const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
      enabled ? 'bg-red-500' : 'bg-gray-300'
    }`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
      enabled ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
);

export const GeneralPanel = () => {
  // State quản lý form
  const [systemName, setSystemName] = useState("Cứu hộ giao thông");
  const [hotline, setHotline] = useState("1900 1234");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    // Chỗ này gọi API: api.put('/settings/general', { systemName, hotline, maintenanceMode })
    console.log("Đang lưu cấu hình...", { systemName, hotline, maintenanceMode });
    alert("Đã lưu thay đổi hệ thống chung!");
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col h-full overflow-y-auto">
      
      {/* HEADER CỦA PANEL */}
      <header className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Cài đặt hệ thống chung</h2>
        <p className="text-sm text-gray-500 mt-1">Thay đổi sẽ được áp dụng trên toàn bộ hệ thống.</p>
      </header>

      {/* FORM NỘI DUNG */}
      <div className="space-y-6 flex-1">
        
        {/* Tên hệ thống */}
        <div>
          <label className="block text-[15px] font-bold text-gray-900 mb-2">Tên hệ thống</label>
          <input
            type="text"
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            className="w-full p-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
            placeholder="Nhập tên hệ thống..."
          />
        </div>

        {/* Hotline */}
        <div>
          <label className="block text-[15px] font-bold text-gray-900 mb-2">Hotline tổng đài</label>
          <input
            type="text"
            value={hotline}
            onChange={(e) => setHotline(e.target.value)}
            className="w-full p-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
            placeholder="Nhập số điện thoại hotline..."
          />
        </div>

        {/* Khu vực Danger: Chế độ bảo trì */}
        <div className="flex items-center justify-between p-5 mt-8 bg-red-50 border border-red-100 rounded-xl">
          <div className="flex gap-4 items-start pr-6">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-red-600">Chế độ bảo trì hệ thống</h3>
              <p className="text-sm text-red-500/80 mt-1 font-medium leading-relaxed">
                Người dùng và đối tác sẽ không thể đăng nhập. Chỉ có Admin có quyền truy cập để nâng cấp hoặc sửa lỗi.
              </p>
            </div>
          </div>
          <ToggleSwitch enabled={maintenanceMode} onChange={setMaintenanceMode} />
        </div>
        
      </div>

      {/* NÚT LƯU NẰM Ở GÓC DƯỚI */}
      <div className="mt-8 pt-6 flex justify-end border-t border-gray-100">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Save className="w-5 h-5" />
          Lưu thay đổi
        </button>
      </div>

    </div>
  );
};

export default GeneralPanel;