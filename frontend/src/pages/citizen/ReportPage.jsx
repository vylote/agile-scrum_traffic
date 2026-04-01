import BottomNavigation from "../../components/BottomNavigation"

export default function ReportPage() {

  return (
    <div className="p-4 pb-20 bg-gray-100 min-h-screen">

      <h1 className="text-xl font-bold mb-4">
        Báo cáo chi tiết
      </h1>

      <textarea
        placeholder="Nhập nội dung báo cáo..."
        className="w-full border rounded-xl p-3 mb-4"
      />

      <button className="w-full bg-blue-500 text-white py-3 rounded-xl">
        Gửi báo cáo
      </button>

      <BottomNavigation />

    </div>
  )
}