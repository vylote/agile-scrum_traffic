export default function EmailForm({ next }) {
  return (
    <div className="card">
      <h2>Xác minh đăng nhập</h2>
      <label>Nhập email</label>
      <input type="email" placeholder="Email..." />
      <button onClick={next}>Tiếp tục</button>
    </div>
  );
}