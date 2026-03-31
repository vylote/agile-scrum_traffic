import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import EmailForm from './components/EmailForm'
import OTPForm from './components/OTPForm'
import ResetPassword from './components/ResetPassword'
import RequestAccess from './components/RequestAccess'
import Success from './components/Success'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Flow Quen mat khau*/}
        <Route path="/verify-email" element={<EmailForm />} />
        <Route path="/verify-otp" element={<OTPForm />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Yêu cầu quyền truy cập */}
        <Route path="/request-access" element={<RequestAccess />} />
        <Route path="/success" element={<Success />} />
        {/* login page */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
       
      </Routes>
    </BrowserRouter>
  )
}