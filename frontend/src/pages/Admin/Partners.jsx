import React, { useState, useEffect } from "react";
import { AdminMenu } from "../../components/Admin/Menu";
import { AdminHeader } from "../../components/Admin/AdminHeader";
import { PartnerSidebar } from "../../components/Admin/PartnerSidebar";
import AddPartnerModal from "../../components/Admin/AddPartnerModal";
import { Plus, Filter, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";

export const Partners = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  
  // partners: danh sách 5 đội của trang hiện tại (để hiển thị bảng)
  const [partners, setPartners] = useState([]);
  
  // allTeams: danh sách TOÀN BỘ đội (để Modal tính toán STT không bị trùng)
  const [allTeams, setAllTeams] = useState([]);
  
  const [loading, setLoading] = useState(true);
  
  // Lưu thông tin phân trang từ Backend
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 5
  });

  // 1. Fetch danh sách đội (có tham số page)
  const fetchTeams = async (page = 1) => {
    try {
      setLoading(true);
      // Gọi danh sách phân trang cho Table (Backend đã fix limit = 5)
      const res = await api.get(`/rescue-teams?page=${page}`);
      const { data, pagination: meta } = res.data.result;
      
      setPartners(data || []);
      setPagination(meta);

      // 🔥 QUAN TRỌNG: Gọi thêm 1 bản không phân trang (limit cực lớn) 
      // để Modal có đủ dữ liệu tính STT chính xác
      const resAll = await api.get("/rescue-teams?page=1&limit=1000");
      setAllTeams(resAll.data.result.data || []);
      
    } catch (error) {
      console.error("Lỗi tải danh sách đối tác:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // 2. Xử lý thêm mới
  const handleAddNewPartner = async (payload) => {
    try {
      await api.post("/rescue-teams", payload);
      setIsModalOpen(false);
      fetchTeams(pagination.currentPage); // Load lại trang hiện tại
    } catch (error) {
      const msg = error.response?.data?.message || "Không thể tạo đội";
      alert("Lỗi: " + msg);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <AdminMenu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdminHeader title="Đối tác cứu hộ" subtitle="Quản lý mạng lưới đội cứu hộ thực tế" />

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col mt-2 overflow-hidden">
            
            {/* Toolbar */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {/* 🔥 Hiển thị tổng số thật từ Database thay vì partners.length */}
                Tất cả đối tác ({pagination.total})
              </h3>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold border border-gray-200" onClick={() => fetchTeams(1)}>
                  Làm mới
                </button>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0088FF] text-white rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all">
                  <Plus size={16} /> Thêm đối tác
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Mã Đội</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Tên Đội</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Khu vực (Zone)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-400">Đang tải dữ liệu...</td></tr>
                  ) : (
                    partners.map((team) => (
                      <tr key={team._id} onClick={() => setSelectedPartner(team)} className="hover:bg-blue-50/40 cursor-pointer transition-all group">
                        <td className="px-6 py-4 font-bold text-gray-400 font-mono">{team.code}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                              {team.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900">{team.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{team.zone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${team.status === "AVAILABLE" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                            {team.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 🔥 THANH PHÂN TRANG (PAGINATION) */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <span className="text-sm text-gray-500 font-medium">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => fetchTeams(pagination.currentPage - 1)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => fetchTeams(pagination.currentPage + 1)}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <PartnerSidebar partner={selectedPartner} onClose={() => setSelectedPartner(null)} />
        
        <AddPartnerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddNewPartner}
          // 🔥 Truyền TOÀN BỘ danh sách đội để Modal tính mã chính xác không lo trùng
          existingTeams={allTeams} 
        />
      </main>
    </div>
  );
};