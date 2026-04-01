import { useNavigate } from "react-router-dom"
import BottomNavigation from "../../components/BottomNavigation"

export default function HomePage() {

  const navigate = useNavigate()

  return (
    <div className="p-4 pb-20 bg-gray-100 min-h-screen">

      <h1 className="text-xl font-bold mb-4">
        Cứu hộ giao thông
      </h1>

      {/* SOS button */}

      <div className="bg-white p-6 rounded-xl shadow mb-4 text-center">

        <p className="text-gray-500 mb-4">
          Bạn đang gặp sự cố?
        </p>

        <button
          onClick={() => navigate("/sos")}
          className="bg-red-500 text-white px-6 py-3 rounded-full"
        >
          SOS Khẩn cấp
        </button>

      </div>

      {/* Report */}

      <div className="bg-white p-4 rounded-xl shadow mb-4">

        <p className="font-semibold mb-2">
          Báo cáo sự cố
        </p>

        <button
          onClick={() => navigate("/report")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Báo cáo
        </button>

      </div>

      <BottomNavigation />

    </div>
  )
}