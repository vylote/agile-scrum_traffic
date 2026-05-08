import { Search, X } from "lucide-react";

export const SearchBar = ({ className, value, onChange, placeholder }) => {
  return (
    <div className={`relative flex items-center w-full ${className || ""}`}>
      <Search className="absolute left-4 w-[18px] h-[18px] text-gray-400 pointer-events-none" />
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Tìm kiếm mã sự cố, tiêu đề, biển số..."}
        className="w-full h-11 pl-11 pr-10 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 transition-all focus:bg-white focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/10 shadow-sm"
      />
      
      {/* Nút xóa nhanh (Chỉ hiện khi có chữ) */}
      {value && (
        <button 
          onClick={() => onChange("")}
          className="absolute right-12 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};