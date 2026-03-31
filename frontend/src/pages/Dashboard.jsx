import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'RESCUE' && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIncidents([
        {
          _id: '101',
          title: 'Tai nạn',
          type: 'ACCIDENT',
          address: '3 Cầu Giấy, Ngọc Khánh, Đống Đa, Hà Nội',
          distance: 'Cách bạn 2.5km',
        },
        {
          _id: '102',
          title: 'Xe tải chết máy',
          type: 'BREAKDOWN',
          address: 'Đường vành đai 3 trên cao',
          distance: 'Cách bạn 4.2km',
        },
        {
          _id: '103',
          title: 'Ngập nước sâu',
          type: 'FLOOD',
          address: 'Ngã tư Thái Hà - Chùa Bộc',
          distance: 'Cách bạn 5.1km',
        },
      ]);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (id, action) => {
    if (action === 'ACCEPT') {
      alert('Đã nhận nhiệm vụ! Bắt đầu điều hướng tới hiện trường.');
    }
    setIncidents((prev) => prev.filter((inc) => inc._id !== id));
  };

  if (!user || (user.role !== 'RESCUE' && user.role !== 'ADMIN')) return null;

  const currentIncident = incidents[0] ?? null;

  return (
    <div className="flex flex-col bg-white">
      <div
        className="flex flex-col self-stretch bg-cover bg-center h-screen"
        style={{
          backgroundImage:
            'url(https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/jit7cw87_expires_30_days.png)',
        }}
      >
        <div className="flex-1 self-stretch py-[23px] flex flex-col">

          {/* STATUS BAR */}
          <div className="flex justify-between items-center self-stretch mb-[39px] mx-6">
            <div className="flex flex-col shrink-0 items-start px-[29px]">
              <span className="text-black text-[17px]">9:41</span>
            </div>
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/12e2p9gf_expires_30_days.png"
              className="w-[95px] h-[22px] object-fill"
              alt="status"
            />
          </div>

          {/* PROFILE ROW */}
          <div className="flex justify-between items-center self-stretch mx-[25px]"
               style={{ marginBottom: currentIncident ? 24 : 369 }}>
            {/* Profile pill */}
            <div className="flex shrink-0 items-center bg-white py-[5px] px-2 gap-[15px] rounded-[27px]">
              <div className="w-10 h-10 bg-[#0088FF] rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col shrink-0 items-start gap-0.5">
                <span className="text-black text-[17px]">{user.name}</span>
                <span className="text-[#8E8E93] text-xs mr-[43px]">XE CỨU HỘ</span>
              </div>
            </div>
            {/* Settings icon */}
            <button
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center border-0 cursor-pointer shadow"
              onClick={() => alert('Cài đặt')}
            >
              <span className="text-lg">⚙️</span>
            </button>
          </div>

          {/* SPACER đẩy card + tabbar xuống đáy */}
          <div className="flex-1" />

          {/* INCIDENT CARD — chỉ hiện khi có sự cố */}
          {currentIncident && (
            <div className="flex flex-col self-stretch bg-white py-5 mb-[26px] mx-[25px] gap-5 rounded-[27px]"
                 style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>

              {/* Card header */}
              <div className="flex justify-between items-center self-stretch mx-[17px]">
                <div className="bg-[#E5F3FF] text-[#0088FF] text-xs font-bold px-3 py-1 rounded-full">
                  {incidents.length} sự cố
                </div>
                <span className="text-[#FF383C] text-xl font-semibold">Phát hiện sự cố</span>
                <div className="w-6 h-6 flex items-center justify-center text-lg">🔴</div>
              </div>

              {/* Incident info box */}
              <div className="flex flex-col self-stretch bg-[#F2F2F7] py-[15px] mx-5 gap-2.5 rounded-[15px]">
                <div className="flex justify-between items-center self-stretch mx-5">
                  <div className="flex flex-col shrink-0 items-start gap-[1px]">
                    <span className="text-black text-xl mr-[38px]">{currentIncident.title}</span>
                    <span className="text-[#8E8E93] text-[13px]">{currentIncident.distance}</span>
                  </div>
                  <span className="text-4xl">
                    {currentIncident.type === 'ACCIDENT' ? '💥' : currentIncident.type === 'FLOOD' ? '🌊' : '🔧'}
                  </span>
                </div>
                <div className="flex items-center self-stretch ml-5 mr-2 gap-[5px]">
                  <span className="text-base">📍</span>
                  <span className="text-black text-[11px]">{currentIncident.address}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center self-stretch mx-5 gap-[7px]">
                <button
                  className="flex flex-1 flex-col items-center bg-[#1B1E65] text-left py-[7px] rounded-[10px] border-0 cursor-pointer"
                  onClick={() => handleAction(currentIncident._id, 'ACCEPT')}
                >
                  <span className="text-white text-[15px]">Nhận nhiệm vụ</span>
                </button>
                <button
                  className="flex flex-1 flex-col items-center bg-[#FF383C] text-left py-[7px] rounded-[10px] border-0 cursor-pointer"
                  onClick={() => handleAction(currentIncident._id, 'REJECT')}
                >
                  <span className="text-white text-[15px]">Từ chối</span>
                </button>
              </div>
            </div>
          )}

          {/* BOTTOM TAB BAR */}
          <div className="flex items-center self-stretch bg-transparent mx-[25px] rounded-[296px]">
            <button
              className="flex flex-col shrink-0 items-center bg-[#EDEDED] text-left py-1.5 px-[35px] ml-0.5 mr-[34px] gap-[1px] rounded-[100px] border-0 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <span className="text-2xl">🗺️</span>
              <span className="text-[#0088FF] text-[10px]">Trang chủ</span>
            </button>

            <div
              className="flex flex-col shrink-0 items-start cursor-pointer"
              onClick={() => navigate('/history')}
            >
              <span className="text-2xl">📋</span>
              <span className="text-[#1A1A1A] text-[10px]">Lịch sử</span>
            </div>

            <div className="flex-1 self-stretch" />

            <div
              className="flex flex-col shrink-0 items-start mr-[41px] cursor-pointer"
              onClick={() => navigate('/messages')}
            >
              <span className="text-2xl">💬</span>
              <span className="text-[#1A1A1A] text-[10px]">Tin nhắn</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;