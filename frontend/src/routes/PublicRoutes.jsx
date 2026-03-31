import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login'; 

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login isAdmin={false} />} />
      <Route path="/admin/login" element={<Login isAdmin={true} />} />
    </Routes>
  );
};