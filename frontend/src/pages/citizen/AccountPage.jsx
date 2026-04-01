import BottomNavigation from "../../components/BottomNavigation"

export default function AccountPage() {
  return (
    <div className="p-4 pb-20 bg-gray-100 min-h-screen">

      <h1 className="text-xl font-bold mb-4">
        Cứu hộ giao thông
      </h1>

      <div className="bg-white rounded-xl p-4 shadow">

        <p className="font-semibold mb-3">
          Tài khoản & Cài đặt
        </p>

        <div className="border-b py-2">
          Phương tiện của tôi
        </div>

        <div className="border-b py-2">
          Liên hệ khẩn cấp
        </div>

        <div className="py-2">
          Ứng dụng
        </div>

      </div>

      <button className="w-full bg-red-500 text-white py-2 rounded-xl mt-6">
        Đăng xuất
      </button>

      <BottomNavigation />

    </div>
  )
}