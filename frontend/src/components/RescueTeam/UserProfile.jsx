import React from "react";
import { useNavigate } from "react-router-dom";
import { Coffee, Zap } from "lucide-react"; 
import { useSelector } from "react-redux"; // 🔥 Import Redux

export const UserProfile = ({ isResting, onToggleRest }) => {
  const navigate = useNavigate();
  
  // 🔥 Móc dữ liệu thật
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  // Lấy ra tên của đội (Xe cứu hộ). Ví dụ: Đội cứu hộ Sóc Sơn 1
  const teamName = user.rescueTeam?.name || "Chưa gán xe";

  return (
    <section className="absolute top-20 left-0 right-0 px-4 w-full z-20 flex items-start justify-between pointer-events-none">
      
      {/* Khối Avatar (Bấm vào để sang Cài đặt) */}
      <div className="flex gap-3 px-2 py-1.5 bg-white/95 backdrop-blur-sm rounded-[100px] shadow-lg border border-gray-100 pointer-events-auto items-center">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/0652c9b603670ade7b0ce94bb139afeed3874bbd"
          className="object-cover shrink-0 w-11 h-11 rounded-full cursor-pointer hover:opacity-80 active:scale-95 transition-all"
          alt="User avatar"
          onClick={() => navigate('/rescue/settings')}
        />
        <div className="flex flex-col justify-center pr-4">
          <h2 className="text-[15px] font-black text-gray-900 leading-tight truncate max-w-[130px]">
             {user.name}
          </h2>
          <p className="text-[10px] font-bold text-[#0088FF] uppercase mt-0.5 truncate max-w-[130px]">
             {teamName}
          </p>
        </div>
      </div>

      <button 
        onClick={onToggleRest}
        className={`my-auto pointer-events-auto hover:scale-105 active:scale-95 transition-transform shadow-[0_8px_16px_rgba(0,0,0,0.15)] w-11 h-11 rounded-full flex items-center justify-center ${
          isResting ? 'bg-gray-200 border-2 border-white' : 'bg-gradient-to-tr from-green-600 to-green-400 border-2 border-white'
        }`}
        aria-label="Toggle Status"
      >
        {isResting
          ? <Coffee size={18} className="text-gray-500" />
          : <Zap size={18} className="text-white fill-white" />
        }
      </button>
      
    </section>
  );
}

export default UserProfile;