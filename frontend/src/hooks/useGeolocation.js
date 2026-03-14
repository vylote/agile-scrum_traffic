import { useState, useCallback } from 'react'; // Bỏ useEffect, thêm useCallback

export const useGeolocation = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState(null);

  // Dùng useCallback để hàm không bị tạo lại mỗi lần render (tránh loop)
  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setError(err.message);
      }
    );
  }, []); // Array rỗng để hàm này luôn cố định

  return { location, error, getPosition };
};