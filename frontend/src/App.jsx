import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login'; // Import thêm màn hình Login của Mobile

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/admin/login" element={<AdminLogin />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;