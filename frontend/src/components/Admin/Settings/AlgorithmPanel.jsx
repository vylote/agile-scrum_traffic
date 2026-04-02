import React, { useState } from 'react';
import { Save, Info, LocateFixed, Timer, Activity } from 'lucide-react';

// Nút Toggle Bật/Tắt dùng chung cho panel này
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

export const AlgorithmPanel = () => {
  const [autoFallback, setAutoFallback] = useState(true);
  const [scanRadius, setScanRadius] = useState(5);
  const [timeoutSecs, setTimeoutSecs] = useState(60);

  const handleSave = () => {
    alert("Đã lưu cấu hình Thuật toán điều phối!");
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col h-full overflow-y-auto">
      
      <header className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Cấu hình thuật toán Auto-Assign</h2>
        <p className="text-sm text-gray-500 mt-1">Các tham số điều khiển cơ chế phân công của Worker Queue.</p>
      </header>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-8">
        <Info className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[15px] text-blue-800 font-medium leading-relaxed">
          Các tham số dưới đây sẽ điều khiển logic của Worker Bull Queue. Hãy cẩn trọng khi thay đổi vì nó ảnh hưởng trực tiếp đến <strong className="font-bold">thời gian phản hồi</strong> của ứng dụng.
        </p>
      </div>

      <div className="space-y-8 flex-1">
        
        {/* Cấu hình quét vị trí */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <LocateFixed className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Cấu hình quét vị trí</h3>
              <p className="text-sm text-gray-500">Ưu tiên tìm đội cứu hộ rảnh rỗi trong bán kính cho phép.</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-700">Bán kính quét mặc định (km)</label>
                <span className="text-blue-600 font-bold">{scanRadius} km</span>
              </div>
              <input 
                type="range" 
                min="1" max="20" step="1"
                value={scanRadius}
                onChange={(e) => setScanRadius(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Cơ chế mở rộng bán kính (Fallback)</h4>
                <p className="text-sm text-gray-500 mt-1">Tự động +2km nếu không tìm thấy xe (Tối đa 3 lần)</p>
              </div>
              <ToggleSwitch enabled={autoFallback} onChange={setAutoFallback} />
            </div>
          </div>
        </section>

        {/* Cấu hình Timeout */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Cấu hình Timeout & Phân công</h3>
              <p className="text-sm text-gray-500">Thời gian đếm ngược chờ tài xế xác nhận đơn.</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-700">Thời gian chờ (Giây)</label>
              <span className="text-blue-600 font-bold">{timeoutSecs}s</span>
            </div>
            <input 
              type="range" 
              min="15" max="120" step="15"
              value={timeoutSecs}
              onChange={(e) => setTimeoutSecs(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500 mt-3 font-medium">
              *Nếu hết giờ không nhận, hệ thống sẽ tự động điều phối (re-assign) cho xe khác có độ ưu tiên cao thứ 2.
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
          Lưu cấu hình thuật toán
        </button>
      </div>

    </div>
  );
};

export default AlgorithmPanel;