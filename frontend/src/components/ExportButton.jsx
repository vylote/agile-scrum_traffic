import { Download } from "lucide-react";

export const ExportButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-900 text-white rounded-xl font-bold text-[15px] transition-colors shadow-sm active:scale-95 ${className}`}
    >
      <Download className="w-5 h-5" />
      Xuất báo cáo (.csv)
    </button>
  );
};