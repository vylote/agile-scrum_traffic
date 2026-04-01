import { Link } from "react-router-dom"
import BottomNavigation from "../../components/BottomNavigation"
import HistoryCard from "../../components/HistoryCard"

export default function HistoryPage() {

  return (
    <div className="p-4 pb-20 bg-gray-100 min-h-screen">

      <h1 className="text-xl font-bold mb-4">
        Lịch sử
      </h1>

      <div className="flex bg-gray-200 rounded-full p-1 mb-4">

        <Link
          to="/history"
          className="flex-1 text-center bg-white rounded-full py-1"
        >
          Đang xử lý
        </Link>

        <Link
          to="/history-complete"
          className="flex-1 text-center py-1"
        >
          Đã hoàn thành
        </Link>

      </div>

      <HistoryCard status="processing" />

      <BottomNavigation />

    </div>
  )
}