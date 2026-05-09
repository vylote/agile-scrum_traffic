import React, { useState } from "react";
// ✅ Đã thêm icon Check vào đây
import { X, ShieldCheck, Zap, Check } from "lucide-react"; 
import {
  RESCUE_TEAM_TYPES,
  ALL_RESCUE_TYPES,
  TEAM_CAPABILITIES,
} from "../../utils/constants/rescueConstants";

const CAPABILITY_LABELS = {
  [TEAM_CAPABILITIES.FIRST_AID]: "Sơ cứu / Cấp cứu",
  [TEAM_CAPABILITIES.TOWING]: "Cẩu kéo xe",
  [TEAM_CAPABILITIES.FIRE_FIGHTING]: "Chữa cháy",
  [TEAM_CAPABILITIES.WATER_RESCUE]: "Cứu hộ đường thủy",
  [TEAM_CAPABILITIES.GENERAL]: "Đa dụng / Khác",
};

const TYPE_PREFIX_MAP = {
  [RESCUE_TEAM_TYPES.AMBULANCE]: "AMB",
  [RESCUE_TEAM_TYPES.TOW_TRUCK]: "TOW",
  [RESCUE_TEAM_TYPES.FIRE]: "FIRE",
  [RESCUE_TEAM_TYPES.POLICE]: "POL",
  [RESCUE_TEAM_TYPES.MULTI]: "MLT",
};

const ZONE_MAP = {
  "Sóc Sơn": "SS",
  "Cầu Giấy": "CG",
  "Đống Đa": "DD",
  "Ba Đình": "BD",
  "Hà Đông": "HD",
  "Khác": "VN", // ✅ Thêm ngoặc cho đồng bộ
};

const initialState = {
  name: "",
  type: RESCUE_TEAM_TYPES.TOW_TRUCK,
  zone: "Sóc Sơn",
  capabilities: [],
};

const AddPartnerModal = ({ onClose, onAdd, existingTeams = [] }) => {
  const [formData, setFormData] = useState(initialState);

  // --- 1. TÍNH TOÁN SMART CODE TỰ ĐỘNG ---
  const typePart = TYPE_PREFIX_MAP[formData.type] || "GEN";
  const zonePart = ZONE_MAP[formData.zone] || "XX";
  const prefix = `${typePart}-${zonePart}-`;

  const matchedTeams = existingTeams.filter(
    (team) =>
      team.code && team.code.toUpperCase().startsWith(prefix.toUpperCase()),
  );

  let nextSequence = "01";
  if (matchedTeams.length > 0) {
    const usedNumbers = matchedTeams
      .map((team) => {
        const parts = team.code.split("-");
        const lastPart = parts[parts.length - 1];
        const numericPart = lastPart.replace(/\D/g, "");
        return parseInt(numericPart, 10);
      })
      .filter((num) => !isNaN(num));

    if (usedNumbers.length > 0) {
      const maxNumber = Math.max(...usedNumbers);
      nextSequence = (maxNumber + 1).toString().padStart(2, "0");
    }
  }

  const generatedCode = `${prefix}${nextSequence}`;

  const handleCapabilityChange = (cap) => {
    setFormData((prev) => {
      const isExist = prev.capabilities.includes(cap);
      if (isExist) {
        return {
          ...prev,
          capabilities: prev.capabilities.filter((c) => c !== cap),
        };
      } else {
        return { ...prev, capabilities: [...prev.capabilities, cap] };
      }
    });
  };

  // --- 2. XỬ LÝ SỰ KIỆN ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ✅ Kiểm tra tên rỗng
    if (!formData.name.trim()) {
        return alert("Vui lòng nhập tên doanh nghiệp");
    }

    const defaultCoords = {
      "Sóc Sơn": { lat: 21.2583, lng: 105.8125 },
      "Cầu Giấy": { lat: 21.0362, lng: 105.7906 },
      "Đống Đa": { lat: 21.0128, lng: 105.8277 },
      "Ba Đình": { lat: 21.0336, lng: 105.834 },
      "Hà Đông": { lat: 20.9716, lng: 105.7709 },
      "Khác": { lat: 21.0285, lng: 105.8542 },
    };

    const coords = defaultCoords[formData.zone] || defaultCoords["Khác"];

    onAdd({
      ...formData,
      name: formData.name.trim(), // ✅ Trim dữ liệu
      code: generatedCode,
      latitude: coords.lat,
      longitude: coords.lng,
      members: [],
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* ... (Phần UI Overlay và Container giữ nguyên) ... */}
      <div
        className="absolute inset-0 bg-[#1e2a5e]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[550px] bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-500" size={28} /> Khởi tạo Đội
            </h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input tên doanh nghiệp */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Tên doanh nghiệp
              </label>
              <input
                type="text"
                required
                className="mt-1.5 px-4 py-3 w-full rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-semibold transition-all"
                placeholder="Nhập tên đối tác..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Select Loại hình và Zone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Loại hình
                </label>
                <select
                  className="mt-1.5 px-4 py-3 w-full rounded-xl border border-gray-200 outline-none font-semibold bg-white cursor-pointer"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  {ALL_RESCUE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Khu vực (Zone)
                </label>
                <select
                  className="mt-1.5 px-4 py-3 w-full rounded-xl border border-gray-200 outline-none font-semibold bg-white cursor-pointer"
                  value={formData.zone}
                  onChange={(e) =>
                    setFormData({ ...formData, zone: e.target.value })
                  }
                >
                  {Object.keys(ZONE_MAP).map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ Checkboxes Năng lực */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Năng lực chuyên môn (Capabilities)
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(CAPABILITY_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.capabilities.includes(value)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.capabilities.includes(value)}
                      onChange={() => handleCapabilityChange(value)}
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        formData.capabilities.includes(value)
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.capabilities.includes(value) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        formData.capabilities.includes(value)
                          ? "text-blue-700"
                          : "text-gray-600"
                      }`}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Smart Code Display & Submit buttons ... */}
            <div className="bg-blue-50 p-5 rounded-2xl border-2 border-blue-100 relative overflow-hidden group">
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1">
                    <Zap size={10} fill="currentColor" /> Mã định danh đề xuất
                  </label>
                  <p className="text-3xl font-mono font-black text-[#1e2a5e] tracking-tighter mt-0.5">
                    {generatedCode}
                  </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100 text-center">
                  <label className="block text-[8px] font-bold text-gray-400 uppercase">STT tiếp theo</label>
                  <span className="text-xl font-mono font-black text-blue-600 block mt-1 leading-none">
                    {nextSequence}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t mt-6 border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 text-sm font-bold text-white bg-[#0088FF] hover:bg-blue-600 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                Đẩy dữ liệu lên hệ thống
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPartnerModal;