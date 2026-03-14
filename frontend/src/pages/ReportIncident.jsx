import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';

const ReportIncident = () => {
    const { location, error, getPosition } = useGeolocation();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [image, setImage] = useState(null);

    // Tự động lấy vị trí khi mở trang
    useEffect(() => {
        getPosition();
    }, [getPosition]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Dùng FormData để gửi được file ảnh
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('latitude', location.lat);
        data.append('longitude', location.lng);
        if (image) data.append('image', image);

        try {
            await api.post('/incidents', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Báo cáo thành công!");
        } catch (err) {
            console.error("Lỗi khi gửi báo cáo", err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Báo cáo sự cố mới</h2>
            
            <input 
                type="text" placeholder="Tiêu đề sự cố"
                className="w-full mb-2 p-2 border"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
            />
            
            <textarea 
                placeholder="Mô tả chi tiết"
                className="w-full mb-2 p-2 border"
                onChange={(e) => setFormData({...formData, description: e.target.value})}
            />

            <div className="mb-2 text-sm text-gray-600">
                Vị trí: {location.lat ? `${location.lat}, ${location.lng}` : "Đang lấy vị trí..."}
                {error && <p className="text-red-500">{error}</p>}
            </div>

            <input 
                type="file" 
                className="mb-4"
                onChange={(e) => setImage(e.target.files[0])}
            />

            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                Gửi báo cáo
            </button>
        </form>
    );
};

export default ReportIncident;