import { useState, useEffect } from 'react';

const useGeolocation = () => {
  // 1. Kiểm tra ngay từ đầu (Đồng bộ)
  const isSupported = 'geolocation' in navigator;

  // 2. Khởi tạo State thông minh: Gán thẳng kết quả vào giá trị ban đầu
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState(isSupported ? '' : 'Trình duyệt của bạn không hỗ trợ định vị GPS.');
  const [loading, setLoading] = useState(isSupported); // Nếu không hỗ trợ thì loading = false luôn

  useEffect(() => {
    // 3. Nếu không hỗ trợ thì thoát luôn, không có setState đồng bộ nào ở đây cả
    if (!isSupported) {
      return;
    }

    // 4. Bắt đầu gọi hàm bất đồng bộ (Lúc này React cho phép setState thoải mái)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.error("Lỗi GPS:", err);
        setError('Không thể lấy vị trí GPS. Vui lòng cấp quyền định vị!');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } 
    );
  }, [isSupported]);

  return { location, error, loading };
};

export default useGeolocation;