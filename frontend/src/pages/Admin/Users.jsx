import React, { useState, useEffect, useCallback } from "react";
import { AdminMenu } from "../../components/Admin/Menu";
import { AdminHeader } from "../../components/Admin/AdminHeader";
import {
  Plus,
  Filter,
  Edit,
  Trash2,
  Search,
  ShieldCheck,
  Truck,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"; // Thay User bằng Truck cho Rescue
import AddAccountForm from "../../components/Admin/AddAccountForm";
import api from "../../services/api";
import { USER_ROLES } from "../../utils/constants/userConstants";

export const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
  });

  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const res = await api.get(`/users?page=${page}&search=${searchTerm}`);
        const { data, pagination: meta } = res.data.result;
        setUsers(data || []);
        setPagination(meta);
      } catch (error) {
        console.error("Lỗi tải danh sách:", error);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm],
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchUsers]);

  const handleCreateAccount = async (formData) => {
    try {
      await api.post("/auth/register", formData);
      setIsModalOpen(false);
      fetchUsers(1);
    } catch (error) {
      alert(
        "Lỗi: " + (error.response?.data?.message || "Không thể tạo tài khoản"),
      );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      <AdminMenu />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdminHeader
          title="Quản lý Đội ngũ & ĐPV"
          subtitle={`Tổng cộng ${pagination.total} nhân sự thực thi`}
        />

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col mt-2 min-h-[600px] overflow-hidden">
            <div className="p-5 flex justify-between items-center gap-4">
              <div className="flex-1 max-w-md relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm nhân viên, email, mã đội..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-full text-[15px] focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0088FF] hover:bg-blue-600 text-white rounded-lg font-bold shadow-md active:scale-95 transition-all"
              >
                <Plus size={18} /> Cấp tài khoản mới
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4">Nhân sự</th>
                    <th className="px-6 py-4">Vai trò / Đội</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-20">
                        <Loader2
                          className="animate-spin mx-auto text-gray-300"
                          size={32}
                        />
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50/80 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border">
                              {user.name?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900">
                                {user.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold w-fit mb-1 ${
                              user.role === USER_ROLES.RESCUE
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : "bg-purple-50 text-purple-600 border-purple-100"
                            }`}
                          >
                            {user.role === USER_ROLES.RESCUE ? (
                              <Truck size={12} />
                            ) : (
                              <ShieldCheck size={12} />
                            )}
                            {user.role}
                          </div>

                          {/* Kiểm tra kỹ: user.rescueTeam bây giờ là một Object */}
                          {user.role === USER_ROLES.RESCUE &&
                          user.rescueTeam ? (
                            <span className="text-[10px] text-blue-500 font-mono font-bold ml-1 bg-blue-50 px-1.5 py-0.5 rounded">
                              Mã đội: {user.rescueTeam.code}
                            </span>
                          ) : user.role === USER_ROLES.RESCUE ? (
                            <span className="text-[10px] text-gray-400 italic ml-1">
                              Chưa gán đội
                            </span>
                          ) : null}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.isActive !== false ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                          >
                            {user.isActive !== false ? "Sẵn sàng" : "Tạm khóa"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit size={16} />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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

            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <span className="text-sm text-gray-500">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => fetchUsers(pagination.currentPage - 1)}
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => fetchUsers(pagination.currentPage + 1)}
                  className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative w-full max-w-[570px] animate-in zoom-in duration-300">
              <AddAccountForm
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateAccount}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
