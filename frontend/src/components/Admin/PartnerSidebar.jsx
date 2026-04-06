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

const AddPersonnelModal = ({ isOpen, onClose, teamName, teamId, onSuccess }) => {
  const [phone, setPhone] = useState("");
  const [foundUser, setFoundUser] = useState(null); // Lưu thông tin User tìm được
  const [roleInTeam, setRoleInTeam] = useState("Lái chính"); // Vai trò trong đội
  const [searching, setSearching] = useState(false);

  if (!isOpen) return null;

  // 🔥 Hàm tìm kiếm User khi nhập đủ số điện thoại (VD: 10 số)
  const handlePhoneChange = async (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Chỉ lấy số
    setPhone(value);
    setFoundUser(null); // Reset user cũ khi đổi số

    if (value.length >= 10) {
      setSearching(true);
      try {
        const res = await api.get(`/users/search-by-phone/${value}`);
        setFoundUser(res.data.result);
      } catch (error) {
        console.log("Không tìm thấy user", error);
      } finally {
        setSearching(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foundUser) return alert("Vui lòng nhập đúng SĐT nhân sự đã đăng ký!");

    try {
      // Gọi API add thành viên (Sử dụng hàm patch addMembers Vy đã có ở Backend)
      await api.patch(`/rescue-teams/${teamId}/members/add`, {
        newMembers: [
          { userId: foundUser._id, role: roleInTeam }
        ]
      });

      alert(`Đã thêm ${foundUser.name} vào đội ${teamName} thành công!`);
      onSuccess?.(); 
      onClose();
      // Reset form
      setPhone(""); setFoundUser(null);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi thêm thành viên");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[450px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <header className="px-6 py-5 border-b bg-gray-50/50">
          <h1 className="text-lg font-black text-gray-900">Thêm thành viên vào đội</h1>
        </header>

        <form className="p-8" onSubmit={handleSubmit}>
          {/* 1. Nhập SĐT để tìm kiếm */}
          <FormField label="Số điện thoại nhân sự" required>
            <div className="relative">
              <input
                type="tel"
                placeholder="Nhập 10 số để tìm..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none font-bold transition-all"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={11}
                required
              />
              {searching && <Loader2 className="absolute right-3 top-3.5 animate-spin text-blue-500" size={20} />}
            </div>
          </FormField>

          {/* 2. Hiện tên User (Read-only) */}
          <FormField label="Họ và tên (Tự động nhận diện)">
            <input
              type="text"
              readOnly
              className={`w-full px-4 py-3 rounded-xl border border-dashed text-sm font-bold ${
                foundUser ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-400"
              }`}
              value={foundUser ? foundUser.name : "Chưa tìm thấy nhân sự..."}
            />
          </FormField>

          {/* 3. Chọn vai trò của ông này trong đội */}
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
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-400">Hủy</button>
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
                <button onClick={() => setIsPersonnelModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white rounded-lg text-[11px] font-bold active:scale-95"><Plus size={14} /> Thêm người</button>
              </div>
              {loading ? <p className="text-center py-10 text-gray-400 text-xs italic">Đang tải dữ liệu...</p> : (
                staffMembers.map((m, idx) => (
                  <div key={m.userId?._id || idx} className="flex items-center justify-between p-4 bg-white border rounded-2xl group hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold uppercase">{m.userId?.name?.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{m.userId?.name || "N/A"}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">{m.role} • {m.userId?.phone}</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
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