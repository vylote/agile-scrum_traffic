import React, { useState, useEffect } from "react";
import { AdminMenu } from "../../components/Admin/Menu";
import { AdminHeader } from "../../components/Admin/AdminHeader"; 
import {
  Filter,
  Download,
  FileSpreadsheet,
  Calendar,
  Plus,
  Loader2,
  FileSearch,
  Trash2 // Thêm icon thùng rác
} from "lucide-react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // ─── 1. LẤY LỊCH SỬ BÁO CÁO TỪ DB ───────────────────────────────────────
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports");
      setReports(res.data.result); 
    } catch (error) {
      console.error("Lỗi tải lịch sử báo cáo:", error);
      toast.error("Không thể tải lịch sử báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ─── 2. HỖ TRỢ TẢI FILE / MỞ CỬA SỔ EXPLORER ───────────────────────────
  const downloadFile = (url) => {
    const fullUrl = `http://localhost:5000${url}`;
    // Mở ở tab mới sẽ tự động trigger cửa sổ "Save As..." của trình duyệt
    window.open(fullUrl, "_blank");
  };

  // ─── 3. KÍCH HOẠT TẠO & TẢI XUỐNG LUÔN (TỪ HEADER) ──────────────────────
  const handleExport = async () => {
    try {
      setIsGenerating(true);
      toast.loading("Đang khởi tạo dữ liệu Excel...", { id: "export-loading" });
      
      const res = await api.post("/reports/generate-incidents");
      
      if (res.data.success) {
        toast.success("Báo cáo đã tạo thành công!", { id: "export-loading" });
        fetchReports(); // Cập nhật lại bảng lịch sử

        // 🔥 TỰ ĐỘNG BẬT CỬA SỔ LƯU FILE KHI VỪA TẠO XONG
        downloadFile(res.data.result.url);
      }
    } catch (error) {
      toast.error("Lỗi khi trích xuất dữ liệu", { id: "export-loading" });
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── 4. XÓA BÁO CÁO ─────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa báo cáo này vĩnh viễn?")) return;
    
    try {
      toast.loading("Đang xóa...", { id: "delete-report" });
      await api.delete(`/reports/${id}`);
      toast.success("Đã xóa báo cáo", { id: "delete-report" });
      fetchReports(); // Tải lại danh sách
    } catch (error) {
      toast.error("Lỗi khi xóa báo cáo", { id: "delete-report" });
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <AdminMenu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader 
          title="Trích xuất dữ liệu hệ thống"
          subtitle="Quản lý lịch sử báo cáo"
          onExport={handleExport} // Truyền function handleExport vào header
        />
        
        <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm flex flex-col mt-2 min-h-[600px] overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center gap-4">
                <h3 className="text-[17px] font-black text-gray-900 uppercase tracking-tight">
                  Lịch sử trích xuất
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                  <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" />
                  Hệ thống Online
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-xs transition-all border border-gray-100 uppercase tracking-widest">
                  <Filter className="w-4 h-4" />
                  Lọc kết quả
                </button>
                <button 
                  onClick={handleExport}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0088FF] hover:bg-blue-600 text-white rounded-xl font-black text-xs transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  TẠO BÁO CÁO MỚI
                </button>
              </div>
            </div>

            {/* Bảng Dữ Liệu Thật */}
            <div className="flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px] gap-3">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Đang tải dữ liệu lịch sử...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                  <div className="p-5 bg-gray-50 rounded-full text-gray-300">
                    <FileSearch size={48} />
                  </div>
                  <p className="text-sm font-bold text-gray-400 italic">Chưa có báo cáo nào được tạo trong hệ thống.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ID</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tên báo cáo</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Loại</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ngày tạo</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kích thước</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reports.map((report) => (
                        <tr key={report._id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-8 py-5">
                            <span className="font-black text-gray-400 text-[11px] font-mono tracking-tighter">
                              {report.reportId}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                                <FileSpreadsheet className="w-5 h-5" />
                              </div>
                              <span className="font-black text-gray-800 text-sm">
                                {report.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                              {report.type}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-gray-500 font-bold text-xs">
                            {new Date(report.createdAt).toLocaleString("vi-VN")}
                          </td>
                          <td className="px-8 py-5 text-gray-400 font-medium text-xs">
                            {report.size}
                          </td>
                          <td className="px-8 py-5 flex items-center justify-end gap-2">
                            {/* Nút Tải Xuống */}
                            <button 
                              onClick={() => downloadFile(report.url)}
                              className="inline-flex items-center gap-2 px-3 py-2 text-[#0088FF] hover:bg-blue-100 font-black text-[11px] rounded-xl transition-all uppercase tracking-widest border border-transparent hover:border-blue-50"
                              title="Tải lại file Excel này"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Tải xuống
                            </button>
                            
                            {/* Nút Xóa Báo Cáo */}
                            <button 
                              onClick={() => handleDelete(report._id)}
                              className="inline-flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 font-black text-[11px] rounded-xl transition-all uppercase tracking-widest border border-transparent hover:border-red-100"
                              title="Xóa báo cáo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};