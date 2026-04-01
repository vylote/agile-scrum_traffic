import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Status Bar */}
      <div className="bg-white flex justify-between items-center px-6 pt-3 pb-2 text-sm font-bold text-black">
        <span>9:41</span>
        <div className="flex gap-1 items-center text-xs">
          <span>▲▲▲</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Cứu hộ giao thông</h1>
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-lg">👤</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {/* SOS Button */}
        <button
          onClick={() => navigate("/sos")}
          className="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-4 shadow-sm hover:bg-red-50 transition-colors border border-gray-100"
        >
          <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black tracking-tight">SOS</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-gray-900">SOS Khẩn cấp</p>
            <p className="text-xs text-gray-400 mt-0.5">Tự động gửi vị trí ngay lập tức</p>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Report Button */}
        <button
          onClick={() => navigate("/report")}
          className="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-4 shadow-sm hover:bg-gray-50 transition-colors border border-gray-100"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-gray-900">Báo cáo chi tiết</p>
            <p className="text-xs text-gray-400 mt-0.5">Mô tả sự cố chi tiết</p>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Map Section */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-2">Bản đồ khu vực</h2>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-blue-400">
            {/* Map notice */}
            <div className="bg-white px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-gray-700">Có 1 đội cứu hộ gần bạn</p>
            </div>
            {/* Fake map */}
            <div className="w-full h-44 bg-gradient-to-br from-green-100 via-green-200 to-blue-200 relative overflow-hidden">
              {/* Map blobs */}
              <div className="absolute w-28 h-20 bg-yellow-200 opacity-50 top-4 left-8" style={{borderRadius:"40% 60% 55% 45%"}} />
              <div className="absolute w-24 h-16 bg-orange-200 opacity-40 top-10 left-24" style={{borderRadius:"55% 45% 40% 60%"}} />
              <div className="absolute w-32 h-20 bg-green-300 opacity-40 top-2 right-4" style={{borderRadius:"45% 55% 60% 40%"}} />
              <div className="absolute w-20 h-14 bg-blue-200 opacity-50 bottom-6 left-12" style={{borderRadius:"60% 40% 50% 50%"}} />
              <div className="absolute w-16 h-12 bg-teal-200 opacity-40 bottom-2 right-16" style={{borderRadius:"50% 50% 40% 60%"}} />
              {/* Map lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 300 180">
                <line x1="0" y1="90" x2="300" y2="80" stroke="#666" strokeWidth="1" />
                <line x1="150" y1="0" x2="160" y2="180" stroke="#666" strokeWidth="1" />
                <line x1="0" y1="130" x2="300" y2="120" stroke="#666" strokeWidth="0.5" />
              </svg>
              {/* Zoom controls */}
              <div className="absolute bottom-3 right-3 flex flex-col bg-white rounded-lg overflow-hidden shadow">
                <button className="w-7 h-7 flex items-center justify-center text-gray-600 font-bold text-base border-b border-gray-100">+</button>
                <button className="w-7 h-7 flex items-center justify-center text-gray-600 font-bold text-base">−</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-50">
        <button className="flex flex-col items-center gap-1 px-4 py-1">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[10px] text-blue-500 font-semibold">Trang chủ</span>
        </button>
        <button onClick={() => navigate("/history")} className="flex flex-col items-center gap-1 px-4 py-1">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-[10px] text-gray-400">Lịch sử</span>
        </button>
        <button onClick={() => navigate("/notifications")} className="flex flex-col items-center gap-1 px-4 py-1">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="text-[10px] text-gray-400">Thông báo</span>
        </button>
      </div>
    </div>
  );
}