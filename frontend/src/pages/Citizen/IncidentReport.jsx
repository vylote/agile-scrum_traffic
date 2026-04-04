import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Camera,
  ChevronDown,
  Check,
  X,
  Plus,
} from "lucide-react"; // Thêm X và Plus
import Map from "../../components/Public/Map";
import api from "../../services/api";
import {
  INCIDENT_TYPES,
  INCIDENT_SEVERITY,
} from "../../utils/constants/incidentConstants";

// (Giữ nguyên CustomDropdown như cũ)
const CustomDropdown = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center cursor-pointer bg-transparent rounded-[20px]"
      >
        <span
          className={`text-[15px] font-bold ${selectedOption?.textColor || "text-gray-900"}`}
        >
          {selectedOption?.label}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition-colors"
              >
                <span
                  className={`text-[15px] font-medium ${opt.textColor || "text-gray-700"}`}
                >
                  {opt.label}
                </span>
                {value === opt.value && (
                  <Check className="w-5 h-5 text-[#0088FF]" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const IncidentReport = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState(INCIDENT_TYPES.ACCIDENT);
  const [selectedSeverity, setSelectedSeverity] = useState(INCIDENT_SEVERITY.LOW);

  const incidentTypes = [
    { id: 1, value: INCIDENT_TYPES.ACCIDENT, label: "Tai nạn giao thông" },
    { id: 2, value: INCIDENT_TYPES.BREAKDOWN, label: "Hỏng xe / Chết máy" },
    { id: 3, value: INCIDENT_TYPES.FLOOD, label: "Ngập nước" },
    { id: 4, value: INCIDENT_TYPES.FIRE, label: "Cháy nổ" },
    { id: 5, value: INCIDENT_TYPES.OTHER, label: "Sự cố khác" },
  ];

  const severityOptions = [
  { id: 1, value: INCIDENT_SEVERITY.LOW, label: 'Thấp', textColor: 'text-blue-500' },
  { id: 2, value: INCIDENT_SEVERITY.MEDIUM, label: 'Trung bình', textColor: 'text-orange-500' },
  { id: 3, value: INCIDENT_SEVERITY.HIGH, label: 'Cao', textColor: 'text-red-500' },
  { id: 4, value: INCIDENT_SEVERITY.CRITICAL, label: 'Nghiêm trọng', textColor: 'text-red-700' },
  ];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => console.error("Lỗi GPS:", err),
        { enableHighAccuracy: true },
      );
    }
  }, []);

  const handlePhotoChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (photos.length + selectedFiles.length > 3) {
      alert("Bạn chỉ được tải lên tối đa 3 ảnh.");
      return;
    }

    setPhotos([...photos, ...selectedFiles]);
    // Reset input để có thể chọn lại cùng 1 file nếu đã xóa
    e.target.value = null;
  };

  // Xử lý xóa ảnh
  const removePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!latitude || !longitude)
      return alert("Đang xác định vị trí GPS, vui lòng đợi thêm giây lát...");

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const typeLabel =
        incidentTypes.find((t) => t.value === selectedType)?.label || "Sự cố";
      const finalTitle = title.trim() !== "" ? title : `Báo cáo: ${typeLabel}`;

      formData.append("title", finalTitle);
      formData.append("type", selectedType);
      formData.append("description", description);
      formData.append("severity", selectedSeverity);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);

      // Append từng ảnh vào mảng photos
      photos.forEach((file) => {
        formData.append("photos", file);
      });

      await api.post("/incidents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(-1);
    } catch (error) {
      console.error("Lỗi khi gửi báo cáo:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] font-sans pb-10">
      <div className="bg-[#F2F2F7] sticky top-0 z-[100] backdrop-blur-md bg-opacity-95">
        <div className="flex justify-between items-center px-8 pt-5 pb-2">
          <span className="text-black font-bold text-[17px]">9:41</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-5 h-3 border border-black rounded-sm relative after:content-[''] after:absolute after:right-[-3px] after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-1 after:bg-black after:rounded-full"></div>
          </div>
        </div>
        <header className="flex items-center px-4 py-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-2 py-2 text-[#0088FF] font-medium active:opacity-50 transition-opacity"
          >
            <ChevronLeft className="w-7 h-7" />
            <span className="text-[17px]">Trở về</span>
          </button>
          <h1 className="flex-1 text-center pr-12 font-bold text-[17px] text-black">
            Báo cáo
          </h1>
        </header>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* (Giữ nguyên phần Vị trí hiện tại, Loại sự cố, Tiêu đề, Mô tả như cũ) */}
        <section className="space-y-3">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">
            Vị trí hiện tại
          </h3>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
            <div className="h-[160px] bg-[#E5E7EB] relative">
              <div className="absolute inset-0 z-0">
                <Map />
              </div>
            </div>
            <div className="p-4 flex justify-between items-center bg-white z-10 relative">
              <div className="flex flex-col">
                <span className="text-black font-bold text-[15px]">
                  {latitude && longitude
                    ? "Đã định vị GPS"
                    : "Đang tìm vị trí..."}
                </span>
                <span className="text-[#8E8E93] text-[12px]">
                  {latitude && longitude
                    ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
                    : "Vui lòng chờ..."}
                </span>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 relative z-30">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">
            Loại sự cố
          </h3>
          <div className="bg-white p-1 rounded-[24px] shadow-sm border border-gray-100">
            <CustomDropdown
              value={selectedType}
              options={incidentTypes}
              onChange={setSelectedType}
            />
          </div>
        </section>

        <section className="space-y-3 relative z-20">
      <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">Mức độ nghiêm trọng</h3>
      <div className="bg-white p-1 rounded-[24px] shadow-sm border border-gray-100">
        <CustomDropdown
          value={selectedSeverity}
          options={severityOptions}
          onChange={setSelectedSeverity}
        />
      </div>
    </section>

        <section className="space-y-3 relative z-10">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">
            Tiêu đề sự cố
          </h3>
          <div className="bg-white p-1 rounded-[24px] shadow-sm border border-gray-100">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Va chạm xe máy, lủng lốp..."
              className="w-full p-4 outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-400 bg-transparent rounded-[20px]"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">
            Mô tả sự cố
          </h3>
          <div className="bg-white p-1 rounded-[24px] shadow-sm border border-gray-100">
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập chi tiết tình trạng sự cố (không bắt buộc)..."
              className="w-full p-4 resize-none outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-400 bg-transparent rounded-[20px]"
            />
          </div>
        </section>

        {/* --- PHẦN ĐIỀU CHỈNH: ẢNH HIỆN TRƯỜNG --- */}
        <section className="space-y-3">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">
            Ảnh hiện trường ({photos.length}/3)
          </h3>

          <div className="flex gap-3 overflow-x-auto pt-2.5 pb-2 scrollbar-hide px-1">
            {/* 1. Nút Thêm Ảnh */}
            {photos.length < 3 && (
              <label className="flex-shrink-0 w-24 h-24 bg-white border-2 border-dashed border-gray-200 rounded-[20px] flex flex-col items-center justify-center cursor-pointer active:bg-gray-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Camera className="w-6 h-6 text-gray-400" />
                <span className="text-[10px] text-gray-400 font-bold mt-1">
                  Thêm ảnh
                </span>
              </label>
            )}

            {/* 2. Danh sách Preview ảnh (Hàng ngang) */}
            {photos.map((file, index) => (
              <div key={index} className="flex-shrink-0 relative w-24 h-24">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover rounded-[20px] shadow-sm border border-gray-100"
                />
                {/* Nút Xóa ảnh */}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md active:scale-90 transition-transform"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Placeholder khi chưa có ảnh */}
            {photos.length === 0 && (
              <div className="w-full bg-white/50 border border-gray-100 rounded-[20px] py-8 flex flex-col items-center justify-center text-gray-300">
                <Plus className="w-5 h-5 opacity-20" />
                <span className="text-[12px] mt-1 italic">
                  Chưa chọn ảnh nào
                </span>
              </div>
            )}
          </div>
        </section>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full text-white font-bold py-4 rounded-[20px] text-[18px] shadow-lg shadow-blue-200 active:scale-[0.98] transition-all ${isSubmitting ? "bg-gray-400" : "bg-[#0088FF] hover:bg-blue-600"}`}
          >
            {isSubmitting ? "Đang xử lý..." : "Gửi báo cáo ngay"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentReport;
