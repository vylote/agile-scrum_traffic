import React from "react";
import { useNavigate } from "react-router-dom";

export const UserProfile = ({ isResting, onToggleRest }) => {
  const navigate = useNavigate();

  return (
    <section className="absolute top-20 left-0 right-0 px-4 w-full z-20 flex items-start justify-between pointer-events-none">
      
      {/* Khối Avatar (Bấm vào để sang Cài đặt) */}
      <div className="flex gap-3 px-2 py-1.5 bg-white rounded-[100px] shadow-lg border border-gray-100 pointer-events-auto items-center">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/0652c9b603670ade7b0ce94bb139afeed3874bbd"
          className="object-cover shrink-0 w-11 h-11 rounded-full cursor-pointer hover:opacity-80 active:scale-95 transition-all"
          alt="User avatar"
          onClick={() => navigate('/rescue/settings')}
        />
        <div className="flex flex-col justify-center pr-4">
          <h2 className="text-base font-bold text-gray-900 leading-tight">Nguyễn Văn A</h2>
          <p className="text-xs text-gray-500 mt-0.5">29H-123.45</p>
        </div>
      </div>

      {/* Nút Toggle Trạng Thái (Nghỉ ngơi / Hoạt động) */}
      <button 
        onClick={onToggleRest}
        className="my-auto pointer-events-auto hover:scale-105 active:scale-95 transition-transform drop-shadow-md" 
        aria-label="Toggle Status"
      >
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/1ae3215ce66e506030b2d3dd0a3a5008a707e622"
          // Nếu đang nghỉ ngơi thì làm mờ nút đi một chút để báo hiệu
          className={`object-contain shrink-0 w-11 h-11 transition-all ${isResting ? 'opacity-50 grayscale' : ''}`}
          alt="Status Menu icon"
        />
      </button>
      
    </section>
  );
}

export default UserProfile;