import React from "react";
import { useNavigate } from "react-router-dom";
import { Coffee, Zap } from "lucide-react"; 

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

      <button 
        onClick={onToggleRest}
        className={`my-auto pointer-events-auto hover:scale-105 active:scale-95 transition-transform drop-shadow-md w-11 h-11 rounded-full flex items-center justify-center ${
          isResting ? 'bg-gray-200' : 'bg-green-500'
        }`}
        aria-label="Toggle Status"
      >
        {isResting
          ? <Coffee size={20} className="text-gray-500" />
          : <Zap size={20} className="text-white" />
        }
      </button>
      
    </section>
  );
}

export default UserProfile;