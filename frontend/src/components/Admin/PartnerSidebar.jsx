import React, { useState, useEffect, useCallback } from "react";
import { 
  X, MapPin, Users, Plus, Trash2, Loader2, Search, Truck, ShieldCheck, CheckCircle2, AlertCircle
} from "lucide-react";
import api from "../../services/api"; 

const FormField = ({ label, required = false, children }) => (
  <div className="mb-4">
    <label className="mb-2 text-sm font-bold text-gray-700 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// 🔥 Modal Multi-select thành viên
const AddPersonnelModal = ({ isOpen, onClose, teamName, teamId, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const showModalToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "error" }), 3500);
  };

  useEffect(() => {
    // 🔥 Đã di chuyển hàm fetchAvailableUsers vào bên trong useEffect
    const fetchAvailableUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users?role=RESCUE");
        const allUsers = res.data.result?.data || res.data.result || [];
        const unassignedUsers = allUsers.filter(u => !u.rescueTeam);
        setUsers(unassignedUsers);
      } catch (err) {
        showModalToast("Không thể tải danh sách nhân sự.", "error");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchAvailableUsers();
      setSelectedUserIds([]);
      setSearchQuery("");
      setToast({ show: false, message: "", type: "success" });
    }
  }, [isOpen]); // Không còn cảnh báo missing dependency nữa

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  const handleCheckbox = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map(u => u._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      showModalToast("Vui lòng chọn ít nhất một nhân sự để thêm vào đội.", "error");
      return;
    }
    setSubmitting(true);

    try {
      const newMembers = selectedUserIds.map(id => ({
        userId: id,
        role
      }));

      await api.patch(`/rescue-teams/${teamId}/members/add`, { newMembers });
      showModalToast(`Đã thêm ${selectedUserIds.length} nhân sự vào đội thành công!`, "success");
      
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || "Lỗi khi gán thành viên vào đội.";
      showModalToast(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[580px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
        {/* TOAST CỦA MODAL */}
        {toast.show && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] z-[120]">
            <div className={`p-3 border rounded-xl shadow-lg flex items-center gap-2 ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-700"}`}>
              {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        <header className="px-6 py-5 border-b bg-gray-50/50 flex justify-between items-center">
          <h1 className="text-lg font-black text-gray-900">Gán nhân sự vào đội {teamName}</h1>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </header>

        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc SĐT..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 max-h-[260px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="py-10 text-center text-gray-400 text-xs flex justify-center items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Đang tải nhân sự...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-xs">Không có nhân viên khả dụng chưa thuộc biên chế.</div>
            ) : (
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase pb-2 border-b border-gray-200 mb-2 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                  />
                  Chọn tất cả
                </label>
                {filteredUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm mb-1.5">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user._id)}
                        onChange={() => handleCheckbox(user._id)}
                        className="rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{user.name}</p>
                        <p className="text-[10px] text-gray-400">{user.phone}</p>
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 font-bold bg-blue-50 text-blue-600 rounded">
                      {user.email}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <FormField label="Vai trò gán chung" required>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white font-semibold outline-none text-sm cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="LEADER">Đội trưởng (LEADER)</option>
              <option value="MEMBER">Thành viên (MEMBER)</option>
            </select>
          </FormField>

          <footer className="flex gap-3 justify-end mt-6 border-t pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-400">Hủy</button>
            <button type="submit" disabled={submitting || selectedUserIds.length === 0} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg active:scale-95 disabled:bg-gray-200 disabled:shadow-none transition-all flex items-center gap-2">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Xác nhận gán ({selectedUserIds.length})
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

// 🔥 Nhận hàm showToast từ cha (Partners.jsx) truyền xuống
export const PartnerSidebar = ({ partner, onClose, onSuccess, showToast }) => {
  const [activeTab, setActiveTab] = useState("organization");
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!partner?._id) return;
    try {
      setLoading(true);
      const res = await api.get(`/rescue-teams/${partner._id}/members`);
      setStaffMembers(res.data.result || []);
    } catch (error) {
      console.error("Lỗi lấy nhân sự:", error);
    } finally {
      setLoading(false);
    }
  }, [partner?._id]);

  useEffect(() => {
    if (partner?._id) {
      fetchMembers();
      setActiveTab("organization");
    }
  }, [fetchMembers, partner?._id]);

  // 🔥 THÊM: HÀM GỠ THÀNH VIÊN KHỎI ĐỘI
  const handleRemoveMember = async (userId, userName) => {
    if (!window.confirm(`Bạn muốn gỡ "${userName}" khỏi đội ${partner.name}?`)) return;
    
    try {
      await api.patch(`/rescue-teams/${partner._id}/members/remove`, {
        userIdsToRemove: [userId]
      });
      
      // Dùng showToast được truyền từ cha xuống
      if (showToast) showToast(`Đã gỡ nhân viên "${userName}" thành công!`, "success");
      
      fetchMembers(); // Tự tải lại danh sách trong Sidebar
      onSuccess?.();  // Tải lại Table bên ngoài để update sĩ số
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || "Lỗi hệ thống khi gỡ thành viên.";
      if (showToast) showToast(errorMsg, "error");
    }
  };

  if (!partner) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="relative w-full max-w-[420px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <header className="flex justify-between items-center px-6 py-5 border-b">
          <div className="flex gap-3 items-center">
            <div className="w-11 h-11 rounded-full bg-blue-50 border flex items-center justify-center font-bold text-blue-600 uppercase">{partner.name?.charAt(0)}</div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{partner.name}</h2>
              <p className="text-xs text-gray-400 font-mono">Mã: {partner.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
        </header>

        <nav className="flex px-6 border-b bg-gray-50/50">
          <button onClick={() => setActiveTab("organization")} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === "organization" ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent"}`}>Thông tin</button>
          <button onClick={() => setActiveTab("personnel")} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === "personnel" ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent"}`}>Nhân sự ({staffMembers.length})</button>
        </nav>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "organization" ? (
            <div className="space-y-4 animate-in fade-in">
              <FormField label="Khu vực"><div className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm border font-medium">{partner.zone}</div></FormField>
              <FormField label="Loại hình"><div className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm border font-medium">{partner.type}</div></FormField>
              <FormField label="Năng lực">
                <div className="flex flex-wrap gap-2">
                  {partner.capabilities?.map((c, i) => <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border">{c}</span>)}
                </div>
              </FormField>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Danh sách đội ngũ</span>
                <button onClick={() => setIsPersonnelModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white rounded-lg text-[11px] font-bold active:scale-95 transition-all"><Plus size={14} /> Thêm người</button>
              </div>
              {loading ? <p className="text-center py-10 text-gray-400 text-xs italic">Đang tải dữ liệu...</p> : (
                staffMembers.map((m, idx) => (
                  <div key={m.userId?._id || idx} className="flex items-center justify-between p-4 bg-white border rounded-2xl group hover:border-blue-200 transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold uppercase">{m.userId?.name?.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{m.userId?.name || "N/A"}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">{m.role} • {m.userId?.phone}</p>
                      </div>
                    </div>
                    {/* 🔥 NÚT XÓA THÀNH VIÊN */}
                    <button 
                      onClick={() => handleRemoveMember(m.userId._id, m.userId.name)}
                      className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <AddPersonnelModal isOpen={isPersonnelModalOpen} onClose={() => setIsPersonnelModalOpen(false)} teamName={partner.name} teamId={partner._id} onSuccess={() => { fetchMembers(); onSuccess?.(); }} />
      </aside>
    </div>
  );
};