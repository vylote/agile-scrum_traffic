import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="h-screen bg-gray-100 p-4 flex flex-col justify-between">

      <div>

        <h1 className="text-xl font-semibold mb-4">
          Cứu hộ giao thông
        </h1>

        <div className="bg-white rounded-xl shadow divide-y">

          <Link to="/sos" className="flex justify-between p-4">
            <span className="text-red-500 font-semibold">
              SOS Khẩn cấp
            </span>
            <span>›</span>
          </Link>

          <Link to="/report" className="flex justify-between p-4">
            <span>Báo cáo chi tiết</span>
            <span>›</span>
          </Link>

        </div>

        <h2 className="mt-6 font-semibold">Bản đồ khu vực</h2>

        <div className="bg-white rounded-xl p-4 mt-2 h-40 flex items-center justify-center">
          Map
        </div>

      </div>

      <div className="bg-white rounded-full p-3 flex justify-around shadow">

        <button className="text-blue-500">Trang chủ</button>
        <button>Lịch sử</button>
        <button>Thông báo</button>

      </div>

    </div>
  );
}