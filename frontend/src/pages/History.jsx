import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";
import socket from "../services/socket";
import { INCIDENT_STATUS } from "../utils/constants/incidentConstants";

const History = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("processing");
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. BẢO VỆ ROUTE: Chưa đăng nhập thì cấm vào
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // 2. GỌI API LẤY LỊCH SỬ
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get("/incidents");
        if (response.data.success) {
          setIncidents(response.data.result.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHistory();
  }, [user]);

  useEffect(() => {
    // Lắng nghe sự kiện update status
    socket.on("incident:updated", (data) => {
      const updatedIncident = data.incident;

      // Tìm và tráo đổi data cũ bằng data mới chạy ngầm
      setIncidents((prevIncidents) =>
        prevIncidents.map((inc) =>
          inc._id === updatedIncident._id ? updatedIncident : inc,
        ),
      );
    });

    // Cleanup khi rời khỏi trang
    return () => {
      socket.off("incident:updated");
    };
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      // --- NHÓM ĐANG XỬ LÝ (Tab: processing) ---
      case INCIDENT_STATUS.PENDING:
        return {
          label: "Đang chờ",
          group: "processing",
          style: "bg-orange-100 text-orange-600",
        };
      case INCIDENT_STATUS.ASSIGNED:
        return {
          label: "Đã tiếp nhận",
          group: "processing",
          style: "bg-indigo-100 text-indigo-600",
        };
      case INCIDENT_STATUS.IN_PROGRESS:
        return {
          label: "Đang giải quyết",
          group: "processing",
          style: "bg-blue-100 text-blue-600",
        };

      case INCIDENT_STATUS.COMPLETED:
        return {
          label: "Hoàn thành",
          group: "completed",
          style: "bg-green-100 text-green-600",
        };
      case INCIDENT_STATUS.CANCELLED:
        return {
          label: "Đã huỷ",
          group: "completed",
          style: "bg-red-100 text-red-600",
        };

      default:
        return {
          label: "Không rõ",
          group: "processing",
          style: "bg-gray-100 text-gray-500",
        };
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      ACCIDENT: "💥",
      BREAKDOWN: "🔧",
      FLOOD: "🌊",
      FIRE: "🔥",
      OTHER: "⚠️",
    };
    return icons[type] || "⚠️";
  };

  // 4. LỌC DATA THEO TAB
  const filtered = incidents.filter((i) => {
    const group = getStatusInfo(i.status).group;
    return group === activeTab;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center pb-[85px]">
      <div className="w-full max-w-md flex flex-col pt-[23px]">
        {/* Status bar */}
        <div className="flex justify-between items-center mb-[39px] px-6">
          <span className="text-black text-[17px] font-semibold">9:41</span>
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/oys9en11_expires_30_days.png"
            className="w-[95px] h-[22px] object-fill"
            alt="status"
          />
        </div>

        {/* Title */}
        <h1 className="text-black text-[34px] font-bold mb-5 px-[25px]">
          Lịch sử
        </h1>

        {/* Segment Control (Tabs) */}
        <div className="flex items-center bg-[#7676801C] p-0.5 mx-[25px] mb-5 gap-1 rounded-[100px]">
          <button
            onClick={() => setActiveTab("processing")}
            className={`flex flex-1 justify-center py-[6px] rounded-[20px] text-[13px] font-medium transition-all ${
              activeTab === "processing"
                ? "bg-white text-black shadow-sm"
                : "text-[#3C3C43]/60"
            }`}
          >
            Đang xử lý
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex flex-1 justify-center py-[6px] rounded-[20px] text-[13px] font-medium transition-all ${
              activeTab === "completed"
                ? "bg-white text-black shadow-sm"
                : "text-[#3C3C43]/60"
            }`}
          >
            Đã hoàn thành
          </button>
        </div>

        {/* Incident List */}
        <div className="flex flex-col gap-3 px-[25px]">
          {loading ? (
            <div className="text-center text-[#8E8E93] py-10 animate-pulse">
              Đang tải dữ liệu...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-5xl">📋</span>
              <span className="text-[#8E8E93] text-[15px]">
                Không có sự cố nào
              </span>
            </div>
          ) : (
            filtered.map((item) => {
              const statusInfo = getStatusInfo(item.status);

              return (
                <Link
                  key={item._id}
                  to={`/incident/${item._id}`}
                  className="flex flex-col bg-white p-5 rounded-[27px] gap-3 shadow-sm active:scale-[0.98] transition-transform cursor-pointer border border-gray-50 text-inherit no-underline block"
                >
                  {/* Top row */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="text-[24px] bg-[#F2F2F7] w-10 h-10 flex items-center justify-center rounded-full">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-black text-[17px] font-bold leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[#8E8E93] text-[12px] mt-0.5">
                          Mã: #{item.code || item._id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle row: Status & Date */}
                  <div className="flex justify-between items-center mt-1">
                    <div
                      className={`py-1 px-3 rounded-full ${statusInfo.style}`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {statusInfo.label}
                      </span>
                    </div>
                    <span className="text-[#8E8E93] text-[12px] font-medium">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {/* Bottom row: Address */}
                  <div className="flex items-start gap-1.5 pt-3 border-t border-gray-100 mt-1">
                    <span className="text-[14px]">📍</span>
                    <span className="text-[#1A1A1A] text-[13px] font-medium leading-snug line-clamp-2">
                      {item.location?.address || "Chưa xác định địa chỉ"}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 w-full max-w-md h-[85px] bg-[#F2F2F7]/90 backdrop-blur-md border-t border-[#E5E5EA] flex justify-around items-center px-4 z-50">
        <button
          className="flex flex-col items-center opacity-60 hover:opacity-100"
          onClick={() => navigate("/")}
        >
          <span className="text-[22px] mb-1 grayscale">🏠</span>
          <span className="text-[#1A1A1A] text-[10px] font-medium">
            Trang chủ
          </span>
        </button>

        <button className="flex flex-col items-center bg-[#EDEDED] py-1.5 px-6 rounded-[100px]">
          <span className="text-[22px] mb-1">📋</span>
          <span className="text-[#0088FF] text-[10px] font-bold">Lịch sử</span>
        </button>

        <button
          className="flex flex-col items-center opacity-60 hover:opacity-100 relative"
          onClick={() => navigate("/notifications")}
        >
          <span className="text-[22px] mb-1 grayscale">🔔</span>
          <span className="text-[#1A1A1A] text-[10px] font-medium">
            Thông báo
          </span>
        </button>
      </div>
    </div>
  );
};

export default History;
