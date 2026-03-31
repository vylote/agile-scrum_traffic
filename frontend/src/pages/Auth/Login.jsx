import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ isAdmin = true }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (isAdmin) {
      navigate('/admin/dashboard'); 
    } else {
       navigate('/citizen/dashboard'); 
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F2F7] md:bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-[420px] bg-[#F2F2F7] md:bg-white min-h-screen md:min-h-0 md:rounded-2xl md:shadow-xl p-8 sm:p-10 flex flex-col justify-center">
        <div className="text-center mb-10 mt-8 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Cứu hộ giao thông
          </h1>
          {/* Tự động đổi phụ đề dựa trên Role đang đăng nhập */}
          <p className="text-lg text-gray-600 font-medium">
            {isAdmin ? "Admin System" : "Đăng nhập hệ thống"}
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-2">
            <label className="text-[17px] font-medium text-gray-900">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-[#C6C6C8] bg-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Nhập tên đăng nhập..."
              required
            />
          </div>

          
          <div className="flex flex-col gap-2">
            <label className="text-[17px] font-medium text-gray-900">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-[#C6C6C8] bg-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>

          
          <div className="flex justify-end mt-[-8px]">
            <span className="text-[#496FC0] text-sm font-medium hover:underline cursor-pointer transition-all">
              Quên mật khẩu?
            </span>
          </div>

          
          <button
            type="submit"
            className="w-full mt-4 h-12 bg-[#EDCA30] hover:bg-[#dcb928] text-gray-900 text-[17px] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-sm"
          >
            Đăng nhập
          </button>
        </form>

        
        {!isAdmin && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <span className="text-[#496FC0] font-bold hover:underline cursor-pointer">
              Đăng ký ngay
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;