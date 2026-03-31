export default function ResetPassword({ next }) {
  return (
    <div className="card">
      <h2>Xác minh đăng nhập</h2>

      <label>Nhập mật khẩu mới</label>
      <input type="password" />

      <label>Xác nhận mật khẩu mới</label>
      <input type="password" />

      <button onClick={next}>Tiếp tục</button>
    </div>
  );
}