import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [coords, setCoords] = useState({ lat: null, lng: null });

  useEffect(() => {
    // Tự động gọi khi hook này được sử dụng lần đầu
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Lỗi lấy vị trí:", err)
    );
  }, []); // [] đảm bảo chỉ chạy 1 lần khi mount-> nếu mảng rỗng thì k thực hiện cập nhật theo code-> đọc kĩ hơn ở module 

  return { coords };
};