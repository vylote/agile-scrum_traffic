import React, { useState } from 'react';
import { Save, Info, BellRing, MessageSquare } from 'lucide-react';

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
      enabled ? 'bg-blue-600' : 'bg-gray-300'
    }`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
      enabled ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
);

export const NotificationsPanel = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsTemplate, setSmsTemplate] = useState(
    "[CUUHO.VN] Bạn có 1 đơn cứu hộ mới: Mã {incident_id} tại {location}. Vui lòng mở App để xác nhận."
  );

  const handleSave = () => {
    console.log("Đang lưu cấu hình thông báo...", { pushEnabled, smsEnabled, smsTemplate });
    alert("Đã lưu cấu hình thông báo thành công!");
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col h-full overflow-y-auto">
      
      <header className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Cấu hình thông báo</h2>
        <p className="text-sm text-gray-500 mt-1">Quản lý cách hệ thống liên lạc với Người dùng và Tài xế.</p>
      </header>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-8">
        <Info className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[15px] text-blue-800 font-medium leading-relaxed">
          Cấu hình các kênh liên lạc đến Tài xế. Khuyến nghị bật cả <strong className="font-bold">SMS Fallback</strong> để đảm bảo tài xế nhận được đơn khi đi vào khu vực sóng 3G/4G yếu.
        </p>
      </div>

      <div className="space-y-8 flex-1">
        {/* Kênh phân phối */}
        <section>
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Các kênh phân phối</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl transition-all hover:border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                  <BellRing className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-gray-900">Push notification (Firebase FCM)</h4>
                  <p className="text-sm text-gray-500 mt-1">Đẩy thông báo trực tiếp trên màn hình App.</p>
                </div>
              </div>
              <ToggleSwitch enabled={pushEnabled} onChange={setPushEnabled} />
            </div>

            <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl transition-all hover:border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-gray-900">Tin nhắn SMS Fallback</h4>
                  <p className="text-sm text-gray-500 mt-1">Gửi tin nhắn SMS truyền thống khi tài xế offline.</p>
                </div>
              </div>
              <ToggleSwitch enabled={smsEnabled} onChange={setSmsEnabled} />
            </div>
          </div>
        </section>

        {/* Mẫu tin nhắn */}
        <section>
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Mẫu tin nhắn tự động</h3>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mẫu SMS báo cáo sự cố mới
            </label>
            <textarea
              rows="3"
              value={smsTemplate}
              onChange={(e) => setSmsTemplate(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-[15px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium"
            ></textarea>
            <p className="text-xs text-gray-500 mt-3 font-medium">
              *Hệ thống hỗ trợ các biến: <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">{'{incident_id}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">{'{location}'}</code>
            </p>
          </div>
        </section>
      </div>

      <div className="mt-8 pt-6 flex justify-end border-t border-gray-100">
        <button
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

export default NotificationsPanel;