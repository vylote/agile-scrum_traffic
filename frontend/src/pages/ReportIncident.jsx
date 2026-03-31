import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import useGeolocation from '../hooks/useGeolocation'; 

const ReportIncident = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const { location, error: gpsError, loading: gpsLoading } = useGeolocation();

  const [formData, setFormData] = useState({ title: '', type: 'ACCIDENT', description: '' });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState({ loading: false, submitError: '', trackingCode: '' });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus(prev => ({ ...prev, submitError: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.lat || !location.lng) {
      setStatus(prev => ({ ...prev, submitError: 'Chưa có tọa độ GPS. Vui lòng kiểm tra lại quyền định vị!' }));
      return;
    }
    if (!formData.title || !formData.description) {
      setStatus(prev => ({ ...prev, submitError: 'Vui lòng nhập tiêu đề và mô tả sự cố!' }));
      return;
    }

    try {
      setStatus({ loading: true, submitError: '', trackingCode: '' });
      const submitData = new FormData();
      submitData.append('type', formData.type);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('latitude', location.lat);
      submitData.append('longitude', location.lng);
      if (photo) submitData.append('photos', photo);

      const response = await api.post('/incidents', submitData);

      if (response.data.success) {
        setStatus({
          loading: false, submitError: '',
          trackingCode: response.data.result.code || 'Đã ghi nhận' 
        });
        setFormData({ title: '', type: 'ACCIDENT', description: '' });
        setPhoto(null);
        setPreview(null);
      }
    } catch (err) {
      setStatus({ 
        loading: false, trackingCode: '',
        submitError: err.response?.data?.message || 'Có lỗi xảy ra khi gửi báo cáo!'
      });
    }
  };

  if (!user) return null;

  return (
    // Khung tổng giả lập Mobile, màu nền #F2F2F7 chuẩn Apple
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center pb-24">
      <div className="w-full max-w-md">
        
        {/* --- HEADER (Status Bar & Title) --- */}
        <div className="flex justify-between items-center pt-[23px] mb-[30px] px-6">
          <span className="text-black text-[17px] font-semibold">9:41</span>
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/6r4zib1a_expires_30_days.png" 
            alt="battery"
            className="w-[95px] h-[22px] object-fill"
          />
        </div>

        <div className="flex items-center mb-[25px] px-[25px] gap-[18px]">
          <span className="text-black text-[34px] font-bold">
            Báo cáo sự cố
          </span>
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/o2vnzpyq_expires_30_days.png" 
            alt="avatar"
            className="w-10 h-10 object-fill rounded-full shadow-sm"
          />
        </div>

        {/* --- TRẠNG THÁI THÀNH CÔNG --- */}
        {status.trackingCode ? (
          <div className="mx-[20px] bg-white rounded-[27px] p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Gửi thành công!</h2>
            <p className="text-gray-500 mb-4">Mã theo dõi của bạn là:</p>
            <div className="bg-[#F2F2F7] py-3 rounded-xl mb-6">
              <span className="text-3xl font-mono font-bold text-black">{status.trackingCode}</span>
            </div>
            <button 
              onClick={() => setStatus({ ...status, trackingCode: '' })}
              className="text-[#0088FF] font-medium"
            >
              Tạo báo cáo mới
            </button>
          </div>
        ) : (
          <div className="px-[20px] flex flex-col gap-4">
            {(gpsError || status.submitError) && (
              <div className="bg-red-100 text-red-600 px-5 py-3 rounded-[20px] text-[15px]">
                {gpsError || status.submitError}
              </div>
            )}

            {/* Khung GPS (Giống card SOS Khẩn cấp) */}
            <div className="flex items-center bg-white py-[13px] px-5 rounded-[27px] shadow-sm">
              <div className="text-2xl mr-4">{gpsLoading ? '⏳' : '📍'}</div>
              <div className="flex flex-col">
                <span className={`text-[17px] font-medium ${!location.lat ? 'text-orange-500' : 'text-[#0088FF]'}`}>
                  {gpsLoading ? 'Đang định vị GPS...' : location.lat ? 'Đã lấy toạ độ' : 'Mất tín hiệu GPS'}
                </span>
                {location.lat && (
                  <span className="text-[#8E8E93] text-[13px]">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                )}
              </div>
            </div>

            {/* Khung Form nhập liệu chính */}
            <div className="bg-white p-5 rounded-[27px] shadow-sm flex flex-col gap-4">
              
              <div>
                <label className="block text-[#1A1A1A] text-[15px] font-medium mb-1.5">Tiêu đề</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleChange} 
                  placeholder="VD: Tai nạn ngã tư..."
                  className="w-full h-[44px] bg-[#F2F2F7] rounded-[12px] px-4 outline-none focus:ring-1 focus:ring-[#0088FF]" 
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] text-[15px] font-medium mb-1.5">Loại sự cố</label>
                <select 
                  name="type" value={formData.type} onChange={handleChange} 
                  className="w-full h-[44px] bg-[#F2F2F7] rounded-[12px] px-4 outline-none appearance-none"
                >
                  <option value="ACCIDENT">Tai nạn giao thông</option>
                  <option value="BREAKDOWN">Hỏng xe / Chết máy</option>
                  <option value="FLOOD">Ngập lụt</option>
                  <option value="FIRE">Cháy nổ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-[#1A1A1A] text-[15px] font-medium mb-1.5">Hình ảnh hiện trường</label>
                <input 
                  type="file" accept="image/*" onChange={handlePhotoChange} 
                  className="w-full text-sm text-[#8E8E93] file:mr-3 file:py-2 file:px-4 file:rounded-[12px] file:border-0 file:text-sm file:font-medium file:bg-[#E5F3FF] file:text-[#0088FF]" 
                />
              </div>

              {preview && (
                <div className="relative w-full h-[150px] rounded-[16px] overflow-hidden">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setPhoto(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex justify-center items-center">✕</button>
                </div>
              )}

              <div>
                <label className="block text-[#1A1A1A] text-[15px] font-medium mb-1.5">Mô tả chi tiết</label>
                <textarea 
                  name="description" value={formData.description} onChange={handleChange} rows="3" 
                  placeholder="Càng chi tiết càng tốt..."
                  className="w-full bg-[#F2F2F7] rounded-[12px] p-4 outline-none focus:ring-1 focus:ring-[#0088FF] resize-none"
                ></textarea>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={status.loading || !location.lat} 
                className={`mt-2 w-full h-[50px] rounded-[25px] flex justify-center items-center ${
                  (status.loading || !location.lat) ? 'bg-[#D1D1D6] text-white' : 'bg-[#FF3B30] text-white shadow-md active:scale-95 transition-transform'
                }`}
              >
                <span className="text-[17px] font-bold">
                  {status.loading ? 'Đang gửi...' : 'Gửi Báo Cáo'}
                </span>
              </button>

            </div>
          </div>
        )}

        {/* --- THANH BOTTOM NAVIGATION GIẢ LẬP --- */}
        <div className="fixed bottom-0 w-full max-w-md h-[80px] bg-white border-t border-[#E5E5EA] flex justify-around items-center px-4 pb-2">
            <Link to="/" className="flex flex-col items-center gap-1 opacity-50">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/stegorcu_expires_30_days.png" className="w-6 h-6 grayscale" />
              <span className="text-[10px] font-medium">Trang chủ</span>
            </Link>
            
            <div className="flex flex-col items-center gap-1 opacity-100">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/gepcpkcy_expires_30_days.png" className="w-6 h-6" />
              <span className="text-[10px] font-medium text-[#0088FF]">Báo cáo</span>
            </div>

            <div className="flex flex-col items-center gap-1 opacity-50">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Bcucpf8ikB/jk4i6par_expires_30_days.png" className="w-6 h-6 grayscale" />
              <span className="text-[10px] font-medium">Lịch sử</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;