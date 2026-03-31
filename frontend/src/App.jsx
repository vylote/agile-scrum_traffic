import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
/* Citizen pages */
import LoginPage from './pages/citizen/LoginPage'
import RegisterPage from './pages/citizen/RegisterPage'
import HomePage from './pages/citizen/HomePage'
import ReportPage from './pages/citizen/ReportPage'
import SOSPage from './pages/citizen/SOSPage'

/* Components flow quên mật khẩu */
import EmailForm from './components/EmailForm'
import OTPForm from './components/OTPForm'
import ResetPassword from './components/ResetPassword'

/* Access request */
import RequestAccess from './components/RequestAccess'
import Success from './components/Success'



export default function App() {
  return (
    <BrowserRouter>
      <Routes>

         {/* ================= CITIZEN ================= */}

        <Route path="/citizen/login" element={<LoginPage />} />
        <Route path="/citizen/register" element={<RegisterPage />} />
        <Route path="/citizen/home" element={<HomePage />} />
        <Route path="/citizen/report" element={<ReportPage />} />
        <Route path="/citizen/sos" element={<SOSPage />} />

        {/* ========== FLOW QUÊN MẬT KHẨU ========== */}

        <Route path="/verify-email" element={<EmailForm />} />
        <Route path="/verify-otp" element={<OTPForm />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ========== YÊU CẦU QUYỀN TRUY CẬP ========== */}

        <Route path="/request-access" element={<RequestAccess />} />
        <Route path="/success" element={<Success />} />

        {/* Redirect mặc định */}
        <Route path="*" element={<Navigate to="/citizen/login" />} />
       
      </Routes>
    </BrowserRouter>
  )
}