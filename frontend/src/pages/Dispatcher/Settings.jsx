import React, { useState } from "react";
import { Menu } from "../../components/Dispatcher/Menu"; 
import { SearchBar } from "../../components/Dispatcher/SearchBar"; 
import { SettingsPanel } from "../../components/Dispatcher/SettingsPanel"; 
import { UserProfileForm } from "../../components/Dispatcher/UserProfileForm"; 

export function Settings() {
  // Trạng thái quản lý xem menu nào đang được chọn
  const [activeItem, setActiveItem] = useState("personal");

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      
      {/* 1. THANH MENU LỚN NGOÀI CÙNG BÊN TRÁI */}
      <Menu />

      {/* 2. KHU VỰC NỘI DUNG BÊN PHẢI */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-[80px] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">
              Cài đặt hệ thống
            </h2>
            <p className="text-sm text-gray-500">
              Quản lý tài khoản và cấu hình
            </p>
          </div>
          <div className="w-[400px]">
            <SearchBar className="w-full" />
          </div>
        </header>

        {/* PHẦN CÀI ĐẶT DƯỚI HEADER */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 mt-2">
            
            {/* Cột trái: Panel chọn menu */}
            <SettingsPanel activeItem={activeItem} setActiveItem={setActiveItem} />

            {/* Cột phải: Hiển thị form tương ứng với menu được chọn */}
            {/* Nếu activeItem là 'personal' thì gọi UserProfileForm ra */}
            {activeItem === "personal" && <UserProfileForm />}
            
            {/* Các form khác sau này bạn tạo xong thì nhét thêm vào đây */}
            {activeItem === "notifications" && (
              <div className="flex-1 p-8 bg-white rounded-xl border border-gray-200">
                <h2 className="text-xl font-bold">Cài đặt thông báo</h2>
                <p className="mt-4 text-gray-500">Đang phát triển...</p>
              </div>
            )}
            
            {activeItem === "security" && (
              <div className="flex-1 p-8 bg-white rounded-xl border border-gray-200">
                <h2 className="text-xl font-bold">Bảo mật & Phân quyền</h2>
                <p className="mt-4 text-gray-500">Đang phát triển...</p>
              </div>
            )}

            {activeItem === "map_config" && (
              <div className="flex-1 p-8 bg-white rounded-xl border border-gray-200">
                <h2 className="text-xl font-bold">Cấu hình bản đồ</h2>
                <p className="mt-4 text-gray-500">Đang phát triển...</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;