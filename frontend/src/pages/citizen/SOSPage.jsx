export default function Report() {
  return (
    <div className="h-screen bg-gray-100 p-4">

      <div className="flex items-center mb-4">
        <button className="mr-2">←</button>
        <h1 className="font-semibold">Báo cáo</h1>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <p className="text-sm text-gray-500">Vị trí hiện tại</p>
        <div className="h-32 bg-gray-200 mt-2 flex items-center justify-center">
          Map
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 space-y-3">

        <p>Tai nạn giao thông</p>
        <p>Hỏng xe / Chết máy</p>
        <p>Ngập nước</p>
        <p>Cháy nổ</p>
        <p>Sự cố khác</p>

      </div>

      <div className="mt-4 bg-white rounded-xl p-4">
        <p className="text-sm text-gray-500 mb-2">Chi tiết bổ sung</p>
        <input className="border w-full p-2 rounded"/>
      </div>

    </div>
  );
}