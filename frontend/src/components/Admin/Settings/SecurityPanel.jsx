import React, { useState } from 'react';
import { Save, ShieldCheck, Clock, AlertOctagon } from 'lucide-react';

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

export const SecurityPanel = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("120");
  const [maxRequests, setMaxRequests] = useState("5");
  const [windowMs, setWindowMs] = useState("15");

  const handleSave = () => {
    alert("Đã lưu cấu hình Bảo mật hệ thống!");
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col h-full overflow-y-auto">
      
      <header className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Bảo mật & Giới hạn API</h2>
        <p className="text-sm text-gray-500 mt-1">Thay đổi sẽ được áp dụng trên toàn bộ hệ thống ngay lập tức.</p>
      </header>

      <div className="space-y-8 flex-1">
        
        {/* Chính sách truy cập */}
        <section>
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Chính sách truy cập</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-gray-900">Bắt buộc Xác thực 2 lớp (2FA)</h4>
                  <p className="text-sm text-gray-500 mt-1">Áp dụng bắt buộc cho các tài khoản có role ADMIN và DISPATCHER.</p>
                </div>
              </div>
              <ToggleSwitch enabled={twoFactorEnabled} onChange={setTwoFactorEnabled} />
            </div>

            <div className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-gray-900">JWT Session Timeout</h4>
                  <p className="text-sm text-gray-500 mt-1">Thời gian (phút) tự động đăng xuất nếu Admin/Điều phối viên không có thao tác.</p>
                </div>
              </div>
              <div className="w-32">
                <select 
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-center"
                >
                  <option value="30">30 Phút</option>
                  <option value="60">60 Phút</option>
                  <option value="120">120 Phút</option>
                  <option value="240">4 Tiếng</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Rate Limiting */}
        <section>
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Giới hạn API (Rate Limiting)</h3>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-lg mb-6">
              <AlertOctagon className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800 font-medium leading-relaxed">
                Tính năng này giúp chống người dùng Spam báo cáo sự cố giả (DDoS Layer 7). Hệ thống sẽ tự động Block IP nếu phát hiện bất thường.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Max Request (App User)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={maxRequests}
                    onChange={(e) => setMaxRequests(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold" 
                  />
                  <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Báo cáo / phút</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cửa sổ phạt (WindowMs)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={windowMs}
                    onChange={(e) => setWindowMs(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold" 
                  />
                  <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Phút (Block IP)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <div className="mt-8 pt-6 flex justify-end border-t border-gray-100">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Save className="w-5 h-5" />
          Lưu cấu hình bảo mật
        </button>
      </div>

    </div>
  );
};

export default SecurityPanel;