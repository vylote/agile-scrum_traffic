import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login'; 
import Register from '../pages/Auth/Register'; 

export const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path='logout'  />
    </Routes>
  );
};