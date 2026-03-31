import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại')
      localStorage.setItem('token', data.token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Logo */}
      <div className="flex flex-col items-center pt-16 pb-8">
        <div className="w-20 h-20 bg-red-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
          <span className="text-4xl">🚨</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Cứu hộ giao thông</h1>
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

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">Email</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="example@gmail.com"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">Mật khẩu</label>
            <input
              type="password" name="password" value={form.password}
              onChange={handleChange} placeholder="Nhập mật khẩu"
              className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
              required
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-red-500 text-white font-semibold py-4 rounded-2xl mt-2 transition active:scale-95 disabled:opacity-60 shadow-lg"
          >
            {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-red-500 font-semibold">
            Đăng ký ngay
          </Link>
        </p>

      </div>
    </div>
  )
}