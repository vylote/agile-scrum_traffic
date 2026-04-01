import BottomNavigation from "../../components/BottomNavigation"

export default function SOSPage() {

  return (
    <div className="p-4 pb-20 bg-gray-100 min-h-screen">

      <h1 className="text-xl font-bold mb-4">
        SOS Khẩn cấp
      </h1>

      <textarea
        placeholder="Mô tả sự cố..."
        className="w-full border rounded-xl p-3 mb-4"
      />

      <button className="w-full bg-red-500 text-white py-3 rounded-xl">
        Gửi yêu cầu cứu hộ
      </button>

      <BottomNavigation />

    </div>
  )
}