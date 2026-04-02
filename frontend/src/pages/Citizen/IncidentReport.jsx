import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  Car,
  Wrench,
  Waves,
  Flame,
  PlusCircle,
  Camera,
  Check,
} from "lucide-react";
import Map from '../../components/Public/Map';
import api from '../../services/api';
import { INCIDENT_TYPES, INCIDENT_SEVERITY } from "../../utils/constants/incidentConstants";

export const IncidentReport = () => {
  const navigate = useNavigate();

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [selectedType, setSelectedType] = useState(INCIDENT_TYPES.ACCIDENT);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incidentTypes = [
    { id: 1, value: INCIDENT_TYPES.ACCIDENT, label: "Tai nạn giao thông", icon: <Car className="w-5 h-5" /> },
    { id: 2, value: INCIDENT_TYPES.BREAKDOWN, label: "Hỏng xe / Chết máy", icon: <Wrench className="w-5 h-5" /> },
    { id: 3, value: INCIDENT_TYPES.FLOOD, label: "Ngập nước", icon: <Waves className="w-5 h-5" /> },
    { id: 4, value: INCIDENT_TYPES.FIRE, label: "Cháy nổ", icon: <Flame className="w-5 h-5" /> },
    { id: 5, value: INCIDENT_TYPES.OTHER, label: "Sự cố khác", icon: <PlusCircle className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        (err) => console.error("Lỗi GPS:", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      return alert("Đang xác định vị trí GPS, vui lòng đợi thêm giây lát...");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Lấy cái label (tiếng Việt) dựa trên value (tiếng Anh) để làm Title cho đẹp
      const typeLabel = incidentTypes.find(t => t.value === selectedType)?.label || "Sự cố";
      formData.append("title", `Báo cáo: ${typeLabel}`); 
      
      //   Truyền đúng dữ liệu Backend cần
      formData.append("type", selectedType); // Gửi "ACCIDENT", "BREAKDOWN"...
      formData.append("description", description); // Nội dung người dân tự gõ
      formData.append("severity", INCIDENT_SEVERITY.MEDIUM); // Mặc định MEDIUM
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      
      if (photo) {
        formData.append("photos", photo);
      }

      await api.post('/incidents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert("Gửi báo cáo thành công! Đội cứu hộ đã nhận được thông tin.");
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
      {/* HEADER */}
      <div className="bg-[#F2F2F7] sticky top-0 z-20">
        <div className="flex justify-between items-center px-8 pt-5 pb-2">
          <span className="text-black font-bold text-[17px]">9:41</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-5 h-3 border border-black rounded-sm relative after:content-[''] after:absolute after:right-[-3px] after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-1 after:bg-black after:rounded-full"></div>
          </div>
        </div>

        <header className="flex items-center px-4 py-2">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 px-2 py-2 text-[#0088FF] font-medium active:opacity-50 transition-opacity">
            <ChevronLeft className="w-7 h-7" />
            <span className="text-[17px]">Trở về</span>
          </button>
          <h1 className="flex-1 text-center pr-12 font-bold text-[17px] text-black">Báo cáo</h1>
        </header>
      </div>

      <div className="px-6 mt-6 space-y-8">
        
        {/* VỊ TRÍ HIỆN TẠI */}
        <section className="space-y-3">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">Vị trí hiện tại</h3>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
            <div className="h-[200px] bg-[#E5E7EB] relative">
              <div className="absolute inset-0 z-0"><Map /></div>
            </div>
            <div className="p-4 flex justify-between items-center bg-white z-10 relative">
              <div className="flex flex-col">
                <span className="text-black font-bold text-[15px]">
                  {latitude && longitude ? "Đã định vị GPS" : "Đang tìm vị trí..."}
                </span>
                <span className="text-[#8E8E93] text-[12px]">
                  {latitude && longitude ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : "Vui lòng chờ..."}
                </span>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>
        </section>

        {/* LOẠI SỰ CỐ */}
        <section className="space-y-3">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">Loại sự cố</h3>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-100">
            {incidentTypes.map((type) => (
              <button
                key={type.id}
                //   Khi bấm, ta lưu cái 'value' tiếng Anh thay vì 'label' tiếng Việt
                onClick={() => setSelectedType(type.value)}
                className="w-full flex items-center px-5 py-4 active:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${selectedType === type.value ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                  {type.icon}
                </div>
                <span className={`flex-1 text-left text-[17px] font-medium ${selectedType === type.value ? "text-black" : "text-gray-600"}`}>
                  {type.label}
                </span>
                {selectedType === type.value && <Check className="w-5 h-5 text-blue-600" />}
              </button>
            ))}
          </div>
        </section>

        {/*   MÔ TẢ CHI TIẾT (MỚI THÊM) */}
        <section className="space-y-3">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">Mô tả sự cố</h3>
          <div className="bg-white p-1 rounded-[24px] shadow-sm border border-gray-100">
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập chi tiết tình trạng sự cố (không bắt buộc)..."
              className="w-full p-4 resize-none outline-none text-[15px] text-gray-900 placeholder:text-gray-400 bg-transparent rounded-[20px]"
            ></textarea>
          </div>
        </section>

        {/* ẢNH HIỆN TRƯỜNG */}
        <section className="space-y-3">
          <h3 className="text-[#727272] text-[13px] font-bold uppercase ml-4">Ảnh hiện trường</h3>
          <div className="bg-white p-3 rounded-[24px] shadow-sm border border-gray-100 relative">
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <button className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-[20px] bg-gray-50 active:bg-gray-100 transition-colors gap-2">
              {photo ? (
                <img src={URL.createObjectURL(photo)} alt="Preview" className="w-full h-32 object-cover rounded-xl p-2" />
              ) : (
                <>
                  <div className="p-3 bg-white rounded-full shadow-sm text-gray-400"><Camera className="w-7 h-7" /></div>
                  <span className="text-[#727272] text-[13px] font-medium">Thêm ảnh (Tuỳ chọn)</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* NÚT GỬI BÁO CÁO */}
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