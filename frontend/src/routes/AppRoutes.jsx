import { Routes, Route } from 'react-router-dom';
import { DispatcherRoutes } from '../routes/DispatcherRoutes';
import { AdminRoutes } from '../routes/AdminRoutes';
import { CitizenRoutes } from '../routes/CitizenRoutes';
import { RescueRoutes } from '../routes/RescueRoutes';
import { USER_ROLES } from '../utils/constants/userConstants';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'
import { Navigate } from 'react-router-dom';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.DISPATCHER]} />}>
        <Route path="/dispatcher/*" element={<DispatcherRoutes />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.CITIZEN]} />}>
        <Route path="/citizen/*" element={<CitizenRoutes />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.RESCUE]} />}>
        <Route path="/rescue/*" element={<RescueRoutes />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>
    </Routes>
  );
};