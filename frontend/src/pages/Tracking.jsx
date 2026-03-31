import { useState, useEffect } from 'react';
import api from '../services/api'; // Đường dẫn tới file config axios của bạn
import socket from '../services/socket';

const Tracking = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hàm gọi API lấy dữ liệu tracking
  const fetchTrackingInfo = async (code) => {
    if (!code) return;
    try {
      setLoading(true);
      setError('');
      // Giả sử API của bạn là GET /incidents/track/:code
      const response = await api.get(`/incidents/track/${code}`);
      const data = response.data.result ? response.data.result.data || response.data.result : response.data.data;
      setIncident(data);
    } catch (err) {
      setError('Không tìm thấy sự cố với mã: '+err);
      setIncident(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrackingInfo(trackingCode);
  };

  // Auto-refresh mỗi 30s khi đã có incident
  useEffect(() => {
    let intervalId;
    if (incident && trackingCode) {
      intervalId = setInterval(() => {
        console.log('Auto-refreshing tracking data...');
        fetchTrackingInfo(trackingCode);
      }, 30000); // 30 giây
    }
    return () => clearInterval(intervalId); // Cleanup khi unmount
  }, [incident, trackingCode]);

  // Lắng nghe Realtime qua Socket
  useEffect(() => {
    socket.on('incident:updated', (data) => {
      if (incident && data.incident._id === incident._id) {
        setIncident(data.incident);
      }
    });

    socket.on('rescue:location', (data) => {
      // Xử lý cập nhật vị trí xe cứu hộ trên bản đồ nếu có
      console.log('Vị trí cứu hộ cập nhật:', data);
    });

    return () => {
      socket.off('incident:updated');
      socket.off('rescue:location');
    };
  }, [incident]);

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-5 flex flex-col items-center">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm mt-5">
        <h1 className="text-2xl font-bold mb-4 text-center">Theo dõi sự cố</h1>
        
        {/* Form nhập mã */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Nhập mã tracking (VD: ACC-...)"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 uppercase"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
            Tra cứu
          </button>
        </form>

        {loading && !incident && <p className="text-center text-gray-500 animate-pulse">Đang tìm kiếm...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Hiển thị kết quả */}
        {incident && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h2 className="font-bold text-lg mb-2">Trạng thái hiện tại: {incident.status}</h2>
              {/* Thông tin đội cứu hộ */}
              {incident.assignedTeam && (
                <div className="text-sm text-gray-700 mt-2 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold">🚑 Đội cứu hộ đang tới</p>
                  <p>Tên đội: {incident.assignedTeam.name || 'Chưa cập nhật'}</p>
                  <p>SĐT liên hệ: {incident.assignedTeam.phone || 'Chưa cập nhật'}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-bold mb-3">Lịch sử cập nhật (Timeline)</h3>
              <div className="relative border-l-2 border-blue-300 ml-3 space-y-4">
                {incident.timeline?.map((point, index) => (
                  <div key={index} className="pl-6 relative">
                    <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-1 border-2 border-white"></div>
                    <p className="font-semibold text-sm">{point.status}</p>
                    <p className="text-xs text-gray-500">{new Date(point.timestamp).toLocaleString('vi-VN')}</p>
                    {point.note && <p className="text-sm text-gray-600 mt-1">{point.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;