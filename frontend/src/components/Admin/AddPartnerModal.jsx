import React, { useState } from "react";
import { X, ShieldCheck, Zap } from "lucide-react";
import {
  RESCUE_TEAM_TYPES,
  ALL_RESCUE_TYPES,
} from "../../utils/constants/rescueConstants";

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
  Khác: "VN",
};

const initialState = {
  name: "",
  type: RESCUE_TEAM_TYPES.TOW_TRUCK,
  zone: "Sóc Sơn",
  capabilities: "Cứu hộ cơ bản",
};

const AddPartnerModal = ({ isOpen, onClose, onAdd, existingTeams = [] }) => {
  const [formData, setFormData] = useState(initialState);

  if (!isOpen) return null;

  // --- 1. TÍNH TOÁN MÃ VÀ SỐ THỨ TỰ (Derived State) ---
  const typePart = TYPE_PREFIX_MAP[formData.type] || "GEN";
  const zonePart = ZONE_MAP[formData.zone] || "XX";
  const prefix = `${typePart}-${zonePart}-`;

  // Tìm các đội đã có cùng Loại và Vùng trong danh sách truyền từ cha vào
  const matchedTeams = existingTeams.filter((team) =>
    team.code?.startsWith(prefix),
  );

  let nextSequence = "01";
  if (matchedTeams.length > 0) {
    const usedNumbers = matchedTeams
      .map((team) => {
        const parts = team.code.split("-");
        return parseInt(parts[parts.length - 1], 10);
      })
      .filter((num) => !isNaN(num));

    if (usedNumbers.length > 0) {
      const maxNumber = Math.max(...usedNumbers);
      nextSequence = (maxNumber + 1).toString().padStart(2, "0");
    }
  }

  const generatedCode = `${prefix}${nextSequence}`;

  // --- 2. XỬ LÝ SỰ KIỆN ---
  const handleInternalClose = () => {
    setFormData(initialState);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tọa độ mặc định (FR-18)
    const defaultCoords = {
      "Sóc Sơn": { lat: 21.2583, lng: 105.8125 },
      "Cầu Giấy": { lat: 21.0362, lng: 105.7906 },
    };
    const coords = defaultCoords[formData.zone] || {
      lat: 21.0285,
      lng: 105.8542,
    };

    onAdd({
      ...formData,
      code: generatedCode, // Gửi mã thông minh lên Server
      latitude: coords.lat,
      longitude: coords.lng,
      capabilities: formData.capabilities.split(",").map((s) => s.trim()),
      members: [],
    });

    setFormData(initialState);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1e2a5e]/40 backdrop-blur-sm"
        onClick={handleInternalClose}
      />

      <div className="relative w-full max-w-[550px] bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-500" size={28} /> Khởi tạo Đội
            </h1>
            <button
              onClick={handleInternalClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Tên doanh nghiệp
              </label>
              <input
                type="text"
                className="mt-1.5 px-4 py-3 w-full rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none font-semibold transition-all"
                required
                placeholder="Nhập tên đối tác..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

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

            {/* HIỂN THỊ SMART CODE */}
            <div className="bg-blue-50 p-5 rounded-2xl border-2 border-blue-100 relative overflow-hidden group">
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <label className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1">
                    <Zap size={10} fill="currentColor" /> Mã định danh đề xuất
                  </label>
                  <p className="text-3xl font-mono font-black text-[#1e2a5e] tracking-tighter">
                    {generatedCode}
                  </p>
                </div>

                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100 text-center">
                  <label className="block text-[8px] font-bold text-gray-400 uppercase">
                    STT tiếp theo
                  </label>
                  <span className="text-xl font-mono font-black text-blue-600">
                    {nextSequence}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleInternalClose}
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
