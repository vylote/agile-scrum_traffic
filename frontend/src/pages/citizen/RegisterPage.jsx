    export default function Register() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 px-6">

      <h1 className="text-2xl font-bold mb-10">Cứu hộ giao thông</h1>

      <div className="w-full max-w-sm space-y-4">

        <div>
          <label className="text-sm">Tên đăng nhập</label>
          <input className="w-full border rounded-lg p-2 mt-1"/>
        </div>

        <div>
          <label className="text-sm">Mật khẩu</label>
          <input type="password" className="w-full border rounded-lg p-2 mt-1"/>
        </div>

        <button className="w-full bg-yellow-400 rounded-lg py-2 font-semibold">
          Đăng ký
        </button>

      </div>

    </div>
  );
}