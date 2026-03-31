export default function OTPForm({ next }) {
  return (
    <div className="card">
      <h2>Xác minh đăng nhập</h2>

      <div className="otp">
        {[...Array(4)].map((_, i) => (
          <input key={i} maxLength="1" />
        ))}
      </div>

      <p>
        Chúng tôi đã gửi mã OTP vào email của bạn. <br />
        Hãy kiểm tra email để thay đổi mật khẩu.
      </p>

      <button onClick={next}>Tiếp tục</button>
    </div>
  );
}