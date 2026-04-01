import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../services/api";
import { Loader2 } from "lucide-react";

export function RegisterForm() {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [role, setRole] = useState("CITIZEN");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        case "DISPATCHER":
          navigate("/dispatcher/dashboard");
          break;
        case "RESCUE":
          navigate("/rescue/dashboard");
          break;
        case "CITIZEN":
          navigate("/citizen/dashboard");
          break;
        default:
          navigate("/");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await api.post("/auth/register", {
        username,
        password,
        name,
        email,
        phone,
        role,
      });

      if (response.data.success) {
        setSuccessMsg("Đăng ký thành công! Đang chuyển hướng đến đăng nhập...");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);

      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="flex flex-col px-9 mt-8 w-full text-black">
      <h1 className="self-center text-4xl font-bold tracking-wide leading-none text-black text-center">
        Cứu hộ giao thông
      </h1>

      <h2 className="self-center mt-8 text-xl tracking-tight leading-none text-black font-[590]">
        Đăng ký tài khoản
      </h2>

      {errorMsg && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg text-center">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm font-medium rounded-lg text-center">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
        <div className="flex flex-col">
          <label
            htmlFor="username"
            className="text-lg tracking-tight leading-none text-black"
          >
            Tên đăng nhập
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading || successMsg !== ""}
            className="mt-1.5 h-10 px-3 rounded-md border border-solid border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:bg-gray-100"
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="text-lg tracking-tight leading-none text-black"
          >
            Họ và tên
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading || successMsg !== ""}
            className="mt-1.5 h-10 px-3 rounded-md border border-solid border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:bg-gray-100"
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-lg tracking-tight leading-none text-black"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || successMsg !== ""}
            className="mt-1.5 h-10 px-3 rounded-md border border-solid border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:bg-gray-100"
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="phone"
            className="text-lg tracking-tight leading-none text-black"
          >
            Số điện thoại
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading || successMsg !== ""}
            className="mt-1.5 h-10 px-3 rounded-md border border-solid border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:bg-gray-100"
            required
          />
        </div>

        {/* ✅ THÊM MỚI: Thẻ SELECT DROPDOWN cho Vai trò */}
        <div className="flex flex-col">
          <label
            htmlFor="role"
            className="text-lg tracking-tight leading-none text-black"
          >
            Vai trò
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading || successMsg !== ""}
            className="mt-1.5 h-10 px-3 rounded-md border border-solid border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:bg-gray-100 cursor-pointer"
          >
            {/* Value là tiếng Anh để gửi backend, Text hiển thị là tiếng Việt cho người dùng dễ hiểu */}
            <option value="CITIZEN">Người dân</option>
            <option value="RESCUE">Đội cứu hộ</option>
            <option value="DISPATCHER">Điều phối viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="password"
            className="text-lg tracking-tight leading-none text-black"
          >
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || successMsg !== ""}
            className="mt-1.5 h-10 px-3 rounded-md border border-solid border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:bg-gray-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || successMsg !== ""}
          className="flex flex-col justify-center items-center self-center px-7 py-2.5 mt-8 max-w-full text-base font-medium bg-amber-400 rounded-xl w-full sm:w-[200px] hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:bg-amber-300 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-black">
              <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
            </span>
          ) : (
            <span className="text-black text-center">Đăng ký ngay</span>
          )}
        </button>

        <div className="mt-4 pb-8 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[#496FC0] font-bold hover:underline cursor-pointer"
          >
            Đăng nhập
          </span>
        </div>
      </form>
    </div>
  );
}

export function Register() {
  return (
    <main className="overflow-auto mx-auto w-full bg-gray-100 max-w-[480px] min-h-screen shadow-lg">
      <RegisterForm />
    </main>
  );
}

export default Register;
