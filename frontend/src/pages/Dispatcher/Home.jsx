import { Menu } from "../../components/Dispatcher/Menu";
import { SearchBar } from "../../components/Dispatcher/SearchBar";
import Map from "../../components/Public/Map";

export const Home = () => {
  return (
    // 1. LAYOUT TỔNG: Tràn viền, nền xám nhạt, không cuộn toàn trang
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans overflow-hidden">
      
      {/* =========================================
          2. SIDEBAR (Chỉ cần 1 dòng duy nhất!)
      ========================================= */}
      <Menu />

      {/* =========================================
          3. NỘI DUNG CHÍNH
      ========================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-[80px] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-1">
              Trung Tâm Điều Phối
            </h2>
            <p className="text-sm text-gray-500">
              Hà Nội, Việt Nam • Cập nhật lúc 07:00
            </p>
          </div>

          {/* SearchBar Component */}
          <div className="w-[400px]">
            <SearchBar 
              className="w-full" 
              property1="default" 
            />
          </div>
        </header>

        {/* VÙNG CHỨA DASHBOARD (Tự động cuộn nếu nội dung dài) */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col lg:flex-row gap-6">
          
          {/* CỘT TRÁI: BẢN ĐỒ (Flex-2 để chiếm không gian lớn hơn) */}
          <section className="flex-[2] bg-white rounded-[20px] shadow-sm border border-gray-200 p-6 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">Bản đồ thời gian thực</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <span className="text-xs font-medium text-gray-700">Lọc hiển thị</span>
              </button>
            </div>
            {/* Vùng chứa Map */}
            <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 relative z-0">
              <Map />
            </div>
          </section>

          {/* CỘT PHẢI: INCIDENTS & FLEET STATUS (Flex-1) */}
          <section className="flex-1 flex flex-col gap-6">
            
            {/* BOX 1: SỰ CỐ CẦN XỬ LÝ */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">Sự cố cần xử lý</h3>
              </div>

              {/* Card SOS */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
                    SOS TAI NẠN
                  </span>
                  <span className="text-xs text-gray-500">Vừa xong</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Ngã tư Cầu Giấy</h4>
                <p className="text-xs text-gray-600 mb-4">Có người bị thương. Xe kẹt giữa ngã tư</p>
                
                <button className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-lg mb-3 transition-colors active:scale-[0.98]">
                  Điều phối xe cứu hộ
                </button>
                
                <div className="flex gap-2">
                  <button className="flex-1 flex justify-center items-center gap-1.5 bg-white border border-red-200 py-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors">
                    <span className="text-xs font-bold">115</span>
                  </button>
                  <button className="flex-1 flex justify-center items-center gap-1.5 bg-[#FFF9E5] border border-yellow-400 py-1.5 rounded-md text-yellow-600 hover:bg-yellow-50 transition-colors">
                    <span className="text-xs font-bold">114</span>
                  </button>
                  <button className="flex-1 flex justify-center items-center gap-1.5 bg-[#E5F9FD] border border-cyan-400 py-1.5 rounded-md text-cyan-600 hover:bg-cyan-50 transition-colors">
                    <span className="text-xs font-bold">113</span>
                  </button>
                </div>
              </div>

              {/* Card Normal */}
              <div className="bg-gray-50 hover:bg-blue-50 cursor-pointer border border-gray-200 rounded-xl p-4 flex justify-between items-center transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Bình thường
                    </span>
                    <span className="text-xs text-gray-500">5 phút trước</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">123 Đường Láng</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Nguyễn Văn A</p>
                </div>
              </div>
            </div>

            {/* BOX 2: TRẠNG THÁI ĐỘI XE */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trạng thái đội xe</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between h-[90px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-gray-600">Sẵn sàng</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">12</div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between h-[90px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-gray-600">Đang bận</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">5</div>
                </div>
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
};