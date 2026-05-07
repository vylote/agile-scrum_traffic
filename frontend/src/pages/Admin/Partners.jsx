import React, { useState, useEffect } from "react";
import { AdminMenu } from "../../components/Admin/Menu";
import { AdminHeader } from "../../components/Admin/AdminHeader";
import { PartnerSidebar } from "../../components/Admin/PartnerSidebar";
import AddPartnerModal from "../../components/Admin/AddPartnerModal";
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";

export const Partners = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const [partners, setPartners] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 5,
  });

  // 🔥 STATE LƯU TRỮ TOAST
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // 🔥 HÀM GỌI TOAST TỰ ĐỘNG TẮT
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // 1. Fetch danh sách đội
  const fetchTeams = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/rescue-teams?page=${page}`);
      const { data, pagination: meta } = res.data.result;

      setPartners(data || []);
      setPagination(meta);

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
      fetchTeams(pagination.currentPage);

      // 🔥 BẮN TOAST MÀU XANH BÁO THÀNH CÔNG
      showToast("Khởi tạo đội cứu hộ thành công!", "success");
    } catch (error) {
      // 🔥 HỨNG LỖI TỪ JOI VÀ BẮN TOAST MÀU ĐỎ
      const errorMsg =
        error.response?.data?.error?.message || "Không thể tạo đội cứu hộ.";
      showToast(errorMsg, "error");
    }
  };

  const handleDeletePartner = async (e, teamId, teamName) => {
    // e.stopPropagation() để ngăn sự kiện click lan ra dòng <tr>, làm mở PartnerSidebar
    e.stopPropagation();

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn giải tán đội "${teamName}"? Toàn bộ nhân sự trong đội sẽ được chuyển về trạng thái tự do.`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/rescue-teams/${teamId}`);
      showToast(`Đã giải tán đội "${teamName}" thành công!`, "success");

      // Đóng Sidebar nếu đang mở đúng cái đội vừa bị xóa
      if (selectedPartner?._id === teamId) {
        setSelectedPartner(null);
      }

      // Load lại dữ liệu
      fetchTeams(pagination.currentPage);
    } catch (error) {
      const errorMsg =
        error.response?.data?.error?.message ||
        "Lỗi hệ thống khi xóa đội cứu hộ.";
      showToast(errorMsg, "error");
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden relative">
      {/* 🔥 KHU VỰC HIỂN THỊ TOAST (NỔI TRÊN CÙNG) */}
      {toast.show && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-[450px] animate-in slide-in-from-top-5 fade-in duration-300">
          <div
            className={`border shadow-xl rounded-2xl p-4 flex items-start gap-3 ${
              toast.type === "error"
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <div
                className={`text-[14px] font-medium leading-tight ${
                  toast.type === "error" ? "text-red-600" : "text-green-700"
                }`}
              >
                {toast.message.includes("|") ? (
                  <ul className="list-none flex flex-col gap-1 mt-0.5">
                    {toast.message.split(" | ").map((err, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="opacity-70 mt-0.5">*</span> {err}
                      </li>
                    ))}
                  </ul>
                ) : (
                  toast.message
                )}
              </div>
            </div>

            <button
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
              className={`shrink-0 p-1 rounded-full transition-colors ${
                toast.type === "error"
                  ? "active:bg-red-100"
                  : "active:bg-green-100"
              }`}
            >
              <X
                className={`w-4 h-4 ${toast.type === "error" ? "text-red-400" : "text-green-500"}`}
              />
            </button>
          </div>
        </div>
      )}

      <AdminMenu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdminHeader
          title="Đối tác cứu hộ"
          subtitle="Quản lý mạng lưới đội cứu hộ thực tế"
        />

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col mt-2 overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                Tất cả đối tác ({pagination.total})
              </h3>
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold border border-gray-200"
                  onClick={() => fetchTeams(1)}
                >
                  Làm mới
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0088FF] text-white rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all"
                >
                  <Plus size={16} /> Thêm đối tác
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                      Mã Đội
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                      Tên Đội
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                      Khu vực (Zone)
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-10 text-gray-400"
                      >
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : (
                    partners.map((team) => (
                      <tr
                        key={team._id}
                        onClick={() => setSelectedPartner(team)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-all group"
                      >
                        <td className="px-6 py-4 font-bold text-gray-400 font-mono">
                          {team.code}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                              {team.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900">
                              {team.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {team.zone}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-md text-[10px] font-bold ${team.status === "AVAILABLE" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}
                          >
                            {team.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) =>
                                handleDeletePartner(e, team._id, team.name)
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
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

        <PartnerSidebar
          partner={selectedPartner}
          onClose={() => setSelectedPartner(null)}
          onSuccess={() => fetchTeams(pagination.currentPage)}
          showToast={showToast}
        />

        {isModalOpen && (
          <AddPartnerModal
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddNewPartner}
            existingTeams={allTeams}
          />
        )}
      </main>
    </div>
  );
};
