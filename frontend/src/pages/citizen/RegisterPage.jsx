import { Link, useNavigate } from "react-router-dom"

export default function RegisterPage() {

  const navigate = useNavigate()

  const handleRegister = (e) => {
    e.preventDefault()
    navigate("/login")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <div className="bg-white p-6 rounded-xl shadow w-80">

        <h1 className="text-2xl font-bold text-center mb-6">
          Đăng ký
        </h1>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Họ tên"
            className="w-full border p-2 rounded mb-3"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded mb-3"
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full border p-2 rounded mb-4"
          />

          <button className="w-full bg-green-500 text-white py-2 rounded">
            Đăng ký
          </button>

        </form>

        <p className="text-sm text-center mt-4">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-500">
            Đăng nhập
          </Link>
        </p>

      </div>

    </div>
  )
}