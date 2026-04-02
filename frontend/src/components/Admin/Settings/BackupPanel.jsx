import React, { useState } from 'react';
import { Server, Save } from 'lucide-react';

// Nút Toggle Bật/Tắt
const Toggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
      enabled ? 'bg-blue-600' : 'bg-gray-300'
    }`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
      enabled ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
);

export const BackupPanel = () => {
  const [autoBackup, setAutoBackup] = useState(true);

  const handleSaveBackupConfig = () => {
    console.log("Đang lưu cấu hình Backup...", { autoBackup });
    alert("Đã lưu cấu hình sao lưu!");
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col h-full overflow-y-auto">
      <header className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Sao lưu & Khôi phục</h2>
        <p className="text-sm text-gray-500 mt-1">Thay đổi sẽ được áp dụng trên toàn bộ hệ thống.</p>
      </header>

      {/* Trạng thái MongoDB */}
      <div className="flex items-center justify-between p-5 bg-slate-900 rounded-xl mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
            <Server className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">MongoDB Atlas (Cluster 0)</h3>
            <p className="text-xs text-slate-400 mt-1">Lưu trữ: 1.2GB / 10GB • Cập nhật: 5 phút trước</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors">
          Backup ngay
        </button>
      </div>

      {/* Cấu hình tự động */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Lịch trình Tự động</h3>
        <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Bật sao lưu tự động hàng ngày</h4>
            <p className="text-xs text-gray-500 mt-1">Lên lịch tải dữ liệu lên AWS S3 Bucket lúc 02:00 AM.</p>
          </div>
          <Toggle enabled={autoBackup} onChange={setAutoBackup} />
        </div>
      </div>

      {/* Nút lưu thay đổi CỦA RIÊNG PANEL NÀY */}
      <div className="mt-auto pt-6 flex justify-end border-t border-gray-100">
        <button 
          onClick={handleSaveBackupConfig}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"
        >
          <Save className="w-5 h-5" />
          Lưu cấu hình sao lưu
        </button>
      </div>
    </div>
  );
};

export default BackupPanel;