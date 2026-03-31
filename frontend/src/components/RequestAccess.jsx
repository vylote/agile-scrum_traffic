export default function RequestAccess({ next }) {
  return (
    <div className="card">
      <h2>Yêu cầu truy cập</h2>

      <label>Nhập email</label>
      <input type="email" />

      <button onClick={next}>Tiếp tục</button>
    </div>
  );
}