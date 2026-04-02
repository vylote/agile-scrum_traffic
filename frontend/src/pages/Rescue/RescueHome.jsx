"use client";
import React, { useState } from 'react';

import Map from '../../components/Public/Map'; 
import StatusBar from '../../components/RescueTeam/StatusBar';
import UserProfile from '../../components/RescueTeam/UserProfile';
import OverviewCard from '../../components/RescueTeam/OverviewCard';
import TabBar from '../../components/RescueTeam/TabBar';
import RestingStatus from '../../components/RescueTeam/RestingStatus'; // ✅ Import component mới

export const RescueHome = () => {
  // Trạng thái của app: normal, new_incident, moving...
  const [appState, setAppState] = useState('normal'); 
  
  // ✅ Trạng thái nghỉ ngơi của tài xế
  const [isResting, setIsResting] = useState(false);

  return (
    <main className="relative mx-auto w-full h-screen max-w-[480px] bg-gray-100 overflow-hidden shadow-2xl">
      
      {/* Lớp Bản đồ thật */}
      <Map />

      {/* Overlay tối màn hình khi có cuốc mới HOẶC khi đang nghỉ ngơi */}
      {(appState === 'new_incident' || isResting) && (
         <div className="absolute inset-0 bg-black/40 z-10 transition-opacity" />
      )}

      {/* Lớp Giao diện nổi bên trên */}
      <div className="absolute inset-0 z-20 flex flex-col pointer-events-none">
        
        <StatusBar />
        
        {/* Truyền state nghỉ ngơi và hàm bật/tắt vào UserProfile */}
        <UserProfile 
          isResting={isResting} 
          onToggleRest={() => setIsResting(!isResting)} 
        />

        <div className="mt-auto flex flex-col w-full">
           
           {/* LOGIC CHUYỂN MÀN HÌNH CHÍNH */}
           {isResting ? (
             // Đang nghỉ thì hiện thẻ Nghỉ ngơi
             <RestingStatus />
           ) : (
             // Đang rảnh/có cuốc thì hiện thẻ Tổng quan / Sự cố
             <OverviewCard appState={appState} setAppState={setAppState} />
           )}

           <div className="pointer-events-auto">
             <TabBar />
           </div>
           
        </div>

      </div>
    </main>
  );
};

export default RescueHome;