import { useState } from "react";

// ── Mock data & constants (từ doc2) ──────────────────────────────────────────
const MOCK_INCIDENTS = [
  {
    _id: "1",
    code: "ACC-20260322-1234",
    type: "ACCIDENT",
    location: { address: "3 Cầu Giấy, Ngọc Khánh, Đống Đa, Hà Nội" },
    status: "ASSIGNED",
    description: "Va chạm giao thông xe máy và ô tô.",
    distance: "2.5km",
    createdAt: new Date().toISOString(),
  },
];

const TYPE_LABEL = {
  ACCIDENT: "Tai nạn",
  BREAKDOWN: "Hỏng xe",
  FLOOD: "Ngập lụt",
  FIRE: "Cháy nổ",
  OTHER: "Sự cố khác",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function RescueDashboard() {
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  const [activeTab, setActiveTab] = useState("home");

  // Socket listener (doc2) — dùng khi tích hợp thật
  // useEffect(() => {
  //   socket.on("incident:new", (data) => {
  //     setIncidents((prev) => [data.incident, ...prev]);
  //   });
  //   return () => socket.off("incident:new");
  // }, []);

  const handleAccept = (id) => {
    alert("Đã nhận nhiệm vụ!");
    setIncidents((prev) => prev.filter((i) => i._id !== id));
  };

  const handleReject = (id) => {
    setIncidents((prev) => prev.filter((i) => i._id !== id));
  };

  return (
    <div className="flex flex-col bg-white">

      {/* ── HERO / MAP BACKGROUND (layout doc1) ─────────────────────────────── */}
      <div
        className="flex flex-col self-stretch bg-cover bg-center h-[852px]"
        style={{
          backgroundImage:
            "url(https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/4fkzyifu_expires_30_days.png)",
        }}
      >
        <div className="flex-1 self-stretch py-[23px]">

          {/* ── STATUS BAR ───────────────────────────────────────────────────── */}
          <div className="flex justify-between items-center self-stretch mb-[39px] mx-6">
            <div className="flex flex-col shrink-0 items-start px-[29px]">
              <span className="text-black text-[17px]">9:41</span>
            </div>
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/omxqwvps_expires_30_days.png"
              className="w-[95px] h-[22px] object-fill"
              alt="status icons"
            />
          </div>

          {/* ── DRIVER CARD (doc1 layout + doc2 data) ───────────────────────── */}
          <div className="flex justify-between items-center self-stretch mb-[369px] mx-[25px]">
            <div className="flex shrink-0 items-center bg-white py-[5px] px-2 gap-[15px] rounded-[27px]">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/ovcy9z8p_expires_30_days.png"
                className="w-10 h-10 object-fill"
                alt="avatar"
              />
              <div className="flex flex-col shrink-0 items-start gap-0.5">
                {/* Tên & biển số từ doc2 */}
                <span className="text-black text-[17px]">Nguyễn Văn A</span>
                <span className="text-[#8E8E93] text-xs mr-[43px]">29H-123.45</span>
              </div>
            </div>
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/qbiwisur_expires_30_days.png"
              className="w-9 h-9 object-fill"
              alt="notification"
            />
          </div>

          {/* ── INCIDENT CARDS (doc1 layout + doc2 dynamic data) ─────────────── */}
          <div className="flex flex-col self-stretch bg-white py-5 mb-[26px] mx-[25px] gap-5 rounded-[27px]">

            {/* Card header */}
            <div className="flex justify-between items-center self-stretch mx-[17px]">
              <div className="w-6 h-6" />
              <span className="text-[#FF383C] text-xl">Phát hiện sự cố</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/8l4ac3qq_expires_30_days.png"
                className="w-6 h-6 object-fill"
                alt="close"
              />
            </div>

            {/* Dynamic incident list (doc2) hoặc empty state */}
            {incidents.length === 0 ? (
              <div className="mx-5 bg-[#F2F2F7] rounded-[15px] py-[15px] px-5 text-center">
                <span className="text-[#8E8E93] text-[14px]">
                  Đang chờ nhiệm vụ mới...
                </span>
              </div>
            ) : (
              incidents.map((incident) => (
                <div key={incident._id} className="flex flex-col gap-2.5">
                  {/* Info block */}
                  <div className="flex flex-col self-stretch bg-[#F2F2F7] py-[15px] mx-5 gap-2.5 rounded-[15px]">
                    <div className="flex justify-between items-center self-stretch mx-5">
                      <div className="flex flex-col shrink-0 items-start gap-[1px]">
                        {/* Loại sự cố từ TYPE_LABEL */}
                        <span className="text-black text-xl mr-[38px]">
                          {TYPE_LABEL[incident.type] || "Sự cố khác"}
                        </span>
                        <div className="flex flex-col items-start pb-[1px]">
                          {/* Khoảng cách từ incident */}
                          <span className="text-[#8E8E93] text-[13px]">
                            Cách bạn {incident.distance || "—"}
                          </span>
                        </div>
                      </div>
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/otctv8ku_expires_30_days.png"
                        className="w-9 h-9 object-fill"
                        alt="incident icon"
                      />
                    </div>
                    {/* Địa chỉ từ incident.location.address */}
                    <div className="flex items-center self-stretch ml-5 mr-2 gap-[5px]">
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/zafq3e94_expires_30_days.png"
                        className="w-6 h-6 object-fill"
                        alt="pin"
                      />
                      <span className="text-black text-[11px]">
                        {incident.location?.address || "Không xác định"}
                      </span>
                      <div className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Action buttons (doc1 layout + doc2 handlers) */}
                  <div className="flex items-center self-stretch mx-5 gap-[7px]">
                    <button
                      className="flex flex-1 flex-col items-center bg-[#1B1E65] text-left py-[7px] rounded-[10px] border-0"
                      onClick={() => handleAccept(incident._id)}
                    >
                      <span className="text-white text-[15px]">Nhận nhiệm vụ</span>
                    </button>
                    <button
                      className="flex flex-1 flex-col items-center bg-[#FF383C] text-left py-[7px] rounded-[10px] border-0"
                      onClick={() => handleReject(incident._id)}
                    >
                      <span className="text-white text-[15px]">Từ chối</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── BOTTOM NAV (doc1 layout + doc2 tab logic) ───────────────────── */}
          <div className="flex items-center self-stretch bg-transparent mx-[25px] rounded-[296px]">

            {/* Trang chủ */}
            <button
              className={`flex flex-col shrink-0 items-center text-left py-1.5 px-[35px] ml-0.5 mr-[34px] gap-[1px] rounded-[100px] border-0 ${
                activeTab === "home" ? "bg-[#EDEDED]" : "bg-transparent"
              }`}
              onClick={() => setActiveTab("home")}
            >
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/2ywp4yqo_expires_30_days.png"
                className="w-6 h-6 object-fill"
                alt="home"
              />
              <span
                className={`text-[10px] ${
                  activeTab === "home" ? "text-[#0088FF]" : "text-[#1A1A1A]"
                }`}
              >
                Trang chủ
              </span>
            </button>

            {/* Lịch sử */}
            <button
              className={`flex flex-col shrink-0 items-start border-0 bg-transparent ${
                activeTab === "history" ? "opacity-100" : "opacity-70"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/knkf7szu_expires_30_days.png"
                className="w-6 h-6 object-fill"
                alt="history"
              />
              <span
                className={`text-[10px] ${
                  activeTab === "history" ? "text-[#0088FF]" : "text-[#1A1A1A]"
                }`}
              >
                Lịch sử
              </span>
            </button>

            <div className="flex-1 self-stretch" />

            {/* Tin nhắn */}
            <button
              className={`flex flex-col shrink-0 items-start mr-[41px] border-0 bg-transparent ${
                activeTab === "message" ? "opacity-100" : "opacity-70"
              }`}
              onClick={() => setActiveTab("message")}
            >
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/5umboqq3_expires_30_days.png"
                className="w-6 h-6 object-fill"
                alt="messages"
              />
              <span
                className={`text-[10px] ${
                  activeTab === "message" ? "text-[#0088FF]" : "text-[#1A1A1A]"
                }`}
              >
                Tin nhắn
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}