import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { login, clearError } from '../../store/slices/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (token) navigate('/')
  }, [token, navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) dispatch(clearError())
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Logo */}
      <div className="flex flex-col items-center pt-16 pb-8">
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
          <span className="text-4xl">🚨</span>
        </div>
        <h1 className="text-2xl font-bold text-navy">Cứu hộ giao thông</h1>
        <p className="text-gray-400 text-sm mt-1">Đăng nhập để tiếp tục</p>
      </div>

      <div className="flex-1 px-6">

        {/* Lỗi */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5 flex gap-2">
            <span className="text-red-400 text-sm">⚠️</span>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); dispatch(login(form)) }}
          className="space-y-4"
        >
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Email
            </label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="example@gmail.com"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              required
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Mật khẩu
            </label>
            <input
              type="password" name="password" value={form.password}
              onChange={handleChange} placeholder="Nhập mật khẩu"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              required
            />
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit" disabled={loading}
            className="w-full bg-primary text-white font-semibold py-4 rounded-2xl mt-2 transition active:scale-95 disabled:opacity-60 shadow-lg shadow-primary/30"
          >
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Đang đăng nhập...
                </span>
              : 'Đăng nhập'
            }
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary font-semibold">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}