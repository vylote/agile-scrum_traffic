import { Search } from "lucide-react";

export const SearchBar = ({ className }) => {
  return (
    <div className={`relative flex items-center w-full ${className || ""}`}>
      {/* Icon Kính lúp (Đặt tuyệt đối bên trong thanh search) */}
      <Search className="absolute left-4 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
      
      {/* Thẻ Input thật - Nơi người dùng gõ phím */}
      <input
        type="text"
        placeholder="Tìm kiếm khu vực, mã sự cố, biển số xe..."
        className="w-full h-11 pl-11 pr-4 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 transition-all focus:bg-white focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/10 shadow-sm"
      />
      
      {/* Phím tắt ảo (Chỉ để trang trí cho giống các Dashboard xịn) */}
      <div className="absolute right-3 hidden sm:flex items-center">
        <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-400 font-medium">
          ⌘K
        </kbd>
      </div>
    </div>
  );
};