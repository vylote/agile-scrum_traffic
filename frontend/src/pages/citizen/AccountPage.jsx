import { useNavigate } from "react-router-dom";

const RESCUE_INFO = [
  { icon: "🚗", label: "Phương tiện của tổ" },
  { icon: "🛡️", label: "Liên hệ khẩn cấp" },
];

const APP_ITEMS = [
  { icon: "⚙️", label: "Phương tiện của tôi" },
];

export default function AccountPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Cứu hộ giao thông</h1>
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-lg">👤</span>
        </div>
      </div>

      {/* Card */}
      <div className="mx-4 mt-4 bg-white rounded-3xl overflow-hidden shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Tài khoản & Cài đặt</h2>
          <button
            onClick={() => navigate(-1)}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Thông tin cứu hộ */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">Thông tin cứu hộ</p>
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              {RESCUE_INFO.map((item, idx) => (
                <button
                  key={idx}
                  className={"w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-100 transition-colors " + (idx < RESCUE_INFO.length - 1 ? "border-b border-gray-200" : "")}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 text-left text-sm font-medium text-gray-800">{item.label}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Ứng dụng */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">Ứng dụng</p>
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              {APP_ITEMS.map((item, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 text-left text-sm font-medium text-gray-800">{item.label}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Đăng xuất */}
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3.5 rounded-2xl text-red-500 text-sm font-bold hover:bg-red-50 transition-colors border border-gray-100"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}