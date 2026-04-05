import React, { useState, useEffect } from "react";
import { BottomNav } from "../../components/Citizen/BottomNav";
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Clock,
  ChevronRight,
  Loader2,
  X, // Đã bổ sung import icon X
} from "lucide-react";
import api from "../../services/api";
import socket from "../../services/socket";
import {
  INCIDENT_TYPES,
  INCIDENT_STATUS,
} from "../../utils/constants/incidentConstants";

export const CitizenHistory = () => {
  const [activeTab, setActiveTab] = useState("processing");
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/incidents");

        const fetchedData = response.data?.result?.data || [];
        setIncidents(fetchedData);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    const handleStatusUpdate = (payload) => {
      const idToUpdate = payload.id || payload.incident?._id;
      const newStatus = payload.status || payload.incident?.status;

      console.log("🔔 Nhận cập nhật trạng thái:", newStatus);

      setIncidents((prevIncidents) => {
        const index = prevIncidents.findIndex((item) => item._id === idToUpdate);

        if (index !== -1) {
          const newIncidents = [...prevIncidents];
          // Ghi đè status mới vào
          newIncidents[index] = { ...newIncidents[index], status: newStatus };
          return newIncidents;
        }

          return prevIncidents;
      });
    };
    socket.on("incident:updated", handleStatusUpdate);

    //roi trang
    return () => {
      socket.off("incident:updated", handleStatusUpdate);
    };
  }, []);

  const getTypeLabel = (type) => {
    const types = {
      [INCIDENT_TYPES.ACCIDENT]: "Tai nạn giao thông",
      [INCIDENT_TYPES.BREAKDOWN]: "Hỏng xe / Chết máy",
      [INCIDENT_TYPES.FLOOD]: "Ngập nước",
      [INCIDENT_TYPES.FIRE]: "Cháy nổ",
      [INCIDENT_TYPES.OTHER]: "Sự cố khác",
      SOS: "SOS Khẩn cấp",
    };
    return types[type] || "Sự cố";
  };

  // 2. Format trạng thái (Đã sửa lại để KHỚP VỚI INCIDENT_STATUS)
  const getStatusConfig = (status) => {
    const configs = {
      [INCIDENT_STATUS.PENDING]: {
        label: "Chờ xử lý",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      [INCIDENT_STATUS.ASSIGNED]: {
        label: "Đã phân công",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      [INCIDENT_STATUS.IN_PROGRESS]: {
        label: "Đang xử lý",
        color: "text-[#0088FF]",
        bgColor: "bg-blue-50",
      },
      [INCIDENT_STATUS.COMPLETED]: {
        label: "Hoàn thành",
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      [INCIDENT_STATUS.CANCELLED]: {
        label: "Đã hủy",
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
    };
    return (
      configs[status] || {
        label: status,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      }
    );
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
      " - " +
      date.toLocaleDateString("vi-VN")
    );
  };

  const processingData = incidents.filter((item) =>
    [
      INCIDENT_STATUS.PENDING,
      INCIDENT_STATUS.ASSIGNED,
      INCIDENT_STATUS.IN_PROGRESS,
    ].includes(item.status),
  );

  // Tab Đã hoàn thành: COMPLETED, CANCELLED
  const completedData = incidents.filter((item) =>
    [INCIDENT_STATUS.COMPLETED, INCIDENT_STATUS.CANCELLED].includes(
      item.status,
    ),
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F7] font-sans pb-24">
      {/* KHU VỰC HEADER CỐ ĐỊNH (STICKY) */}
      <div className="sticky top-0 z-40 bg-[#F2F2F7] pb-4 backdrop-blur-md bg-opacity-95 shadow-sm">
        {/* 1. STATUS BAR */}
        <div className="flex justify-between items-center px-8 pt-5 pb-2">
          <span className="text-black font-bold text-[17px]">9:41</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-5 h-3 border border-black rounded-sm relative after:content-[''] after:absolute after:right-[-3px] after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-1 after:bg-black after:rounded-full"></div>
          </div>
        </div>

        {/* 2. TIÊU ĐỀ TRANG */}
        <div className="px-7 mt-4 mb-4">
          <h1 className="text-black text-[34px] font-bold">Lịch sử</h1>
        </div>

        {/* 3. SEGMENTED CONTROL */}
        <div className="px-6">
          <div className="flex bg-[#7676801C] p-0.5 rounded-full">
            <button
              onClick={() => setActiveTab("processing")}
              className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                activeTab === "processing"
                  ? "bg-white shadow-sm text-black"
                  : "text-gray-500"
              }`}
            >
              Đang xử lý ({processingData.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                activeTab === "completed"
                  ? "bg-white shadow-sm text-black"
                  : "text-gray-500"
              }`}
            >
              Đã hoàn thành ({completedData.length})
            </button>
          </div>
        </div>
      </div>
      {/* HẾT KHU VỰC CỐ ĐỊNH */}

      {/* 4. DANH SÁCH LỊCH SỬ */}
      <div className="px-6 space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-[#0088FF] gap-2">
            <Loader2 size={40} className="animate-spin" />
            <p className="text-sm font-medium text-gray-500 mt-2">
              Đang tải lịch sử...
            </p>
          </div>
        )}

        {/* TAB ĐANG XỬ LÝ */}
        {!isLoading &&
          activeTab === "processing" &&
          processingData.map((item) => {
            const statusCfg = getStatusConfig(item.status);
            return (
              <div
                key={item._id}
                className="bg-white p-5 rounded-[27px] shadow-sm active:scale-[0.98] transition-transform flex flex-col gap-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-50 text-red-500">
                      <AlertCircle size={24} />
                    </div>
                    <span className="text-black text-[18px] font-bold">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  <div
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${statusCfg.bgColor} ${statusCfg.color}`}
                  >
                    {statusCfg.label}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={14} />
                    <span className="text-[13px]">
                      Mã: {item.code || "Đang cập nhật"} •{" "}
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={14}
                      className="text-gray-400 mt-0.5 shrink-0"
                    />
                    <span className="text-gray-700 text-[13px] leading-tight flex-1 line-clamp-2">
                      {item.location?.address || "Chưa xác định địa chỉ"}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 shrink-0"
                    />
                  </div>
                </div>
              </div>
            );
          })}

        {/* TAB ĐÃ HOÀN THÀNH */}
        {!isLoading &&
          activeTab === "completed" &&
          completedData.map((item) => {
            const shortId = item._id
              ? item._id.slice(-4).toUpperCase()
              : "----";
            // Cập nhật lại biến kiểm tra theo constant
            const isResolved = item.status === INCIDENT_STATUS.COMPLETED;

            return (
              <div
                key={item._id}
                className="flex items-center bg-white p-5 gap-4 rounded-[27px] shadow-sm active:scale-[0.98] transition-transform"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isResolved ? "bg-green-50" : "bg-red-50"}`}
                >
                  {isResolved ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <X className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  <span className="text-black text-[18px] font-bold leading-tight">
                    {isResolved ? "Hoàn thành sự cố" : "Sự cố đã bị hủy"}
                  </span>
                  <span className="text-[#727272] text-[14px] leading-snug">
                    {getTypeLabel(item.type)} #{shortId}{" "}
                    {isResolved ? "đã được xử lý xong." : "đã bị hủy."}
                  </span>
                  <span className="text-[#AEAEB2] text-[12px] font-medium mt-0.5">
                    {formatTime(item.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}

        {/* MÀN HÌNH TRỐNG */}
        {!isLoading &&
          ((activeTab === "processing" && processingData.length === 0) ||
            (activeTab === "completed" && completedData.length === 0)) && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <Clock size={48} strokeWidth={1} opacity={0.3} />
              <p className="text-sm">Không có dữ liệu lịch sử</p>
            </div>
          )}
      </div>

      <BottomNav />
    </div>
  );
};
