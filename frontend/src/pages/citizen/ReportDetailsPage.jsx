import { useState } from "react";

const INCIDENTS = [
  { id: 1, label: "Tai nạn giao thông", icon: "🚗" },
  { id: 2, label: "Hỏng xe / Chết máy", icon: "🔧" },
  { id: 3, label: "Ngập nước", icon: "💧" },
  { id: 4, label: "Cháy nổ", icon: "🔥" },
  { id: 5, label: "Sự cố khác", icon: "❓" },
];

export default function ReportDetailsPage() {
  const [selected, setSelected] = useState(1);

  return (
    <div className="w-[375px] min-h-screen bg-gray-100 font-sans mx-auto">
      {/* Status Bar */}
      <div className="bg-white flex justify-between items-center px-6 pt-3 pb-2 text-sm font-bold text-black">
        <span>9:41</span>
        <div className="flex gap-1 items-center text-xs">
          <span>▲▲▲</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Top Nav – viền dashed tím */}
      <div className="bg-white flex items-center px-4 py-3 border-2 border-dashed border-purple-400 relative">
        <button className="flex items-center gap-1 text-purple-500 text-sm font-semibold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Trở về
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-gray-900">
          Báo cáo
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        {/* Vị trí hiện tại */}
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-5 mb-2">
          Vị trí hiện tại
        </p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Map */}
          <div className="w-full h-28 bg-gradient-to-br from-green-100 via-green-200 to-blue-300 relative overflow-hidden">
            <div className="absolute w-20 h-14 bg-yellow-300 opacity-40 top-2 left-10 rounded-[40%_60%_55%_45%]" />
            <div className="absolute w-16 h-12 bg-orange-300 opacity-40 top-8 left-28 rounded-[55%_45%_40%_60%]" />
            <div className="absolute w-16 h-14 bg-green-300 opacity-40 top-3 right-12 rounded-[45%_55%_60%_40%]" />
            <div className="absolute w-12 h-10 bg-blue-200 opacity-50 bottom-2 left-16 rounded-[60%_40%_50%_50%]" />
          </div>
          {/* Location info */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">3 Cầu Giấy</p>
              <p className="text-xs text-gray-400 mt-0.5">Ngọc Khánh, Đống Đa, Hà Nội</p>
            </div>
            <button className="text-purple-500 text-sm font-semibold px-2">Sửa</button>
          </div>
        </div>

        {/* Loại sự cố */}
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-5 mb-2">
          Loại sự cố
        </p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {INCIDENTS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 transition-colors
                ${idx < INCIDENTS.length - 1 ? "border-b border-gray-100" : ""}
                ${selected === item.id ? "bg-purple-50" : "hover:bg-gray-50"}`}
            >
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-lg flex-shrink-0">
                {item.icon}
              </div>
              <span className="flex-1 text-left text-sm font-medium text-gray-900">
                {item.label}
              </span>
              {selected === item.id && (
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Chi tiết bổ sung */}
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-5 mb-2">
          Chi tiết bổ sung
        </p>
        <div className="bg-white rounded-2xl border-2 border-dashed border-purple-100 flex flex-col items-center justify-center py-6 gap-1.5 cursor-pointer hover:border-purple-300 transition-colors shadow-sm">
          <span className="text-3xl">📷</span>
          <p className="text-sm text-gray-400">Thêm ảnh hiện trường</p>
          <p className="text-xs text-gray-300">(Tùy chọn)</p>
        </div>
      </div>
    </div>
  );
}