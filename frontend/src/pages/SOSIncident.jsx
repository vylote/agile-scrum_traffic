import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import useGeolocation from '../hooks/useGeolocation';

const SOSIncident = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Lấy toạ độ GPS (Cực kỳ quan trọng cho SOS)
  const { location, loading: gpsLoading, error: gpsError } = useGeolocation();

  // State quản lý đếm ngược và trạng thái API
  const [countdown, setCountdown] = useState(3);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  // 1. BẢO VỆ ROUTE
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // 2. LOGIC ĐẾM NGƯỢC
  useEffect(() => {
    // Nếu vẫn còn đếm ngược, và chưa gửi, chưa thành công
    if (countdown > 0 && !isSending && !isSuccess) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer); // Xóa timer nếu component bị unmount (bấm Hủy)
    }
  }, [countdown, isSending, isSuccess]);

  // 3. LOGIC GỬI API KHI ĐẾM VỀ 0
  useEffect(() => {
    const sendSOS = async () => {
      // Chặn gọi API nhiều lần
      if (isSending || isSuccess) return; 

      if (!location.lat || !location.lng) {
        setApiError('Không lấy được toạ độ GPS. Vui lòng bật định vị!');
        return;
      }

      try {
        setIsSending(true);
        const response = await api.post('/incidents/sos', {
          latitude: location.lat,
          longitude: location.lng
        });

        if (response.data.success) {
          setIsSuccess(true);
        }
      } catch (err) {
        setApiError(err.response?.data?.message || 'Lỗi mạng khi gửi SOS!');
        setIsSending(false);
      }
    };

    // Khi bộ đếm về 0, đợi GPS load xong thì mới gửi
    if (countdown === 0 && !gpsLoading) {
      sendSOS();
    }
  }, [countdown, gpsLoading, location, isSending, isSuccess]);

  const handleCancel = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#34C759] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-8xl mb-6">🚁</div>
        <h2 className="text-white text-[32px] font-bold mb-4">ĐÃ GỬI SOS!</h2>
        <p className="text-white text-xl mb-12 px-4">
          Tín hiệu của bạn kèm vị trí GPS đã được gửi đến lực lượng cứu hộ gần nhất. Vui lòng giữ bình tĩnh và ở yên tại vị trí an toàn.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-white text-[#34C759] py-4 px-12 rounded-[20px] text-xl font-bold active:scale-95 transition-transform shadow-lg"
        >
          Quay về Trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FF383C] flex flex-col items-center">
      <div className="w-full max-w-md h-screen flex flex-col relative pt-[21px]">
        
        {/* Header Status Bar (Mô phỏng) */}
        <div className="flex justify-between items-center mb-8 mx-6">
          <span className="text-white text-[17px] font-semibold">9:41</span>
          {/* Dùng icon pin giả lập bằng emoji thay vì ảnh tĩnh để ko bị lỗi link */}
          <span className="text-white text-[17px]">🔋 100%</span>
        </div>

        {/* Nội dung chính giữa màn hình */}
        <div className="flex-1 flex flex-col items-center justify-center px-[25px]">
          
          <div className="text-9xl mb-8 animate-pulse">🆘</div>
          
          <span className="text-white text-[28px] font-bold mb-4 text-center">
            {countdown > 0 ? "Đang gửi tín hiệu SOS" : "Đang kết nối..."}
          </span>
          
          {/* Cảnh báo lỗi GPS hoặc API nếu có */}
          {(gpsError || apiError) ? (
            <div className="bg-white text-red-600 p-4 rounded-xl mb-4 font-medium text-center shadow-lg">
              {gpsError || apiError}
            </div>
          ) : (
            <span className="text-[#FFD1D1] text-xl text-center px-6 mb-8">
              Hệ thống sẽ tự động phát tín hiệu khẩn cấp kèm GPS trong:
            </span>
          )}

          {/* Vòng đếm ngược khổng lồ */}
          {!isSending && countdown > 0 && (
            <div className="w-40 h-40 border-8 border-white rounded-full flex items-center justify-center mb-12 shadow-lg">
              <span className="text-white text-8xl font-bold">
                {countdown}
              </span>
            </div>
          )}

          {/* Trạng thái Loading lúc gửi */}
          {(isSending || (countdown === 0 && gpsLoading)) && (
            <div className="flex flex-col items-center mb-12">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-white text-lg font-medium">
                {gpsLoading ? 'Đang lấy tọa độ...' : 'Đang phát tín hiệu...'}
              </span>
            </div>
          )}

        </div>

        {/* Nút Hủy (Cố định ở dưới cùng) */}
        <div className="px-6 pb-12 w-full">
          <button 
            disabled={isSending || isSuccess}
            className={`w-full py-4 rounded-[20px] text-[24px] font-bold transition-transform shadow-lg ${
              isSending ? 'bg-white/30 text-white cursor-not-allowed' : 'bg-white text-[#FF383C] active:scale-95'
            }`}
            onClick={handleCancel}
          >
            {isSending ? 'Đang xử lý...' : 'Huỷ'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SOSIncident;