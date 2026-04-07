import React, { useState, useEffect, useCallback } from "react";
import { 
  X, Phone, MapPin, Users, Info, Plus, Trash2, 
  ChevronDown, CheckCircle2, Save, ShieldCheck, Loader2 
} from "lucide-react";
import api from "../../services/api"; 

// --- 1. COMPONENT UI HỖ TRỢ ---
const FormField = ({ label, required = false, children }) => (
  <div className="mb-4">
    <label className="mb-2 text-sm font-bold text-gray-700 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// --- 2. MODAL THÊM NHÂN SỰ (Gán bằng SĐT) ---
const AddPersonnelModal = ({ isOpen, onClose, teamName, teamId, onSuccess }) => {
  const [phone, setPhone] = useState("");
  const [foundUser, setFoundUser] = useState(null); 
  const [roleInTeam, setRoleInTeam] = useState("Lái chính"); 
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // 🔥 Hàm reset state và đóng modal
  const handleInternalClose = () => {
    setPhone("");
    setFoundUser(null);
    setErrorMsg("");
    setSearching(false);
    onClose();
  };

  // 🔥 Tìm kiếm User khi nhập đủ 10 số điện thoại
  const handlePhoneChange = async (e) => {
    const value = e.target.value.replace(/\D/g, ""); 
    setPhone(value);
    setFoundUser(null);
    setErrorMsg("");

    if (value.length >= 10) {
      setSearching(true);
      try {
        const res = await api.get(`/users/search-by-phone/${value}`);
        setFoundUser(res.data.result);
      } catch (error) {
        // Lấy message lỗi từ Backend (Ví dụ: "Nhân viên đã thuộc đội khác")
        setErrorMsg(error.response?.data?.message || "Không tìm thấy nhân sự cứu hộ phù hợp.");
      } finally {
        setSearching(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foundUser) return;

    try {
      // ✅ CHUẨN: Dùng PATCH để cập nhật thêm thành viên vào mảng của Đội
      await api.patch(`/rescue-teams/${teamId}/members/add`, {
        newMembers: [
          { userId: foundUser._id, role: roleInTeam }
        ]
      });

      alert(`Đã gán thành công ${foundUser.name} vào đội ${teamName}!`);
      onSuccess?.(); // Sidebar cha sẽ tự động load lại danh sách nhân viên
      handleInternalClose(); 
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi gán thành viên vào hệ thống.");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleInternalClose} />
      <div className="relative w-full max-w-[450px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <header className="px-6 py-5 border-b bg-gray-50/50 flex justify-between items-center">
          <h1 className="text-lg font-black text-gray-900">Gán nhân sự vào đội</h1>
          <button onClick={handleInternalClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </header>

        <form className="p-8" onSubmit={handleSubmit}>
          {/* Nhập SĐT */}
          <FormField label="Số điện thoại nhân viên" required>
            <div className="relative">
              <input
                type="tel"
                placeholder="Nhập 10 số điện thoại..."
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none font-bold transition-all ${
                  errorMsg ? "border-red-100 bg-red-50" : "border-gray-100 focus:border-blue-500"
                }`}
                value={phone}
                onChange={handlePhoneChange}
                maxLength={11}
              />
              {searching && <Loader2 className="absolute right-3 top-3.5 animate-spin text-blue-500" size={20} />}
            </div>
            {errorMsg && <p className="mt-1.5 text-[11px] text-red-500 font-bold italic">{errorMsg}</p>}
          </FormField>

          {/* Tên nhân viên (Chỉ đọc) */}
          <FormField label="Họ tên nhân sự">
            <input
              type="text"
              readOnly
              placeholder="Hệ thống sẽ tự nhận diện..."
              className={`w-full px-4 py-3 rounded-xl border border-dashed text-sm font-bold ${
                foundUser ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-400"
              }`}
              value={foundUser ? foundUser.name : ""}
            />
          </FormField>

          {/* Chọn vai trò */}
          <FormField label="Vai trò trong đội này" required>
            <select 
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white font-semibold outline-none cursor-pointer"
              value={roleInTeam}
              onChange={(e) => setRoleInTeam(e.target.value)}
            >
              <option value="Lái chính">Lái chính</option>
              <option value="Lái phụ">Lái phụ</option>
              <option value="Kỹ thuật viên">Kỹ thuật viên</option>
            </select>
          </FormField>

          <footer className="flex gap-3 justify-end mt-8 border-t pt-6">
            <button type="button" onClick={handleInternalClose} className="px-6 py-2.5 text-sm font-bold text-gray-400">Hủy</button>
            <button 
              type="submit" 
              disabled={!foundUser} 
              className="px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg active:scale-95 disabled:bg-gray-200 disabled:shadow-none transition-all"
            >
              Xác nhận gán vào đội
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

// --- 3. COMPONENT CHÍNH PARTNER SIDEBAR ---
export const PartnerSidebar = ({ partner, onClose }) => {
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
                    <button className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <AddPersonnelModal isOpen={isPersonnelModalOpen} onClose={() => setIsPersonnelModalOpen(false)} teamName={partner.name} teamId={partner._id} onSuccess={fetchMembers} />
      </aside>
    </div>
  );
};