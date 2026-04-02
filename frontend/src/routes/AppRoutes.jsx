import { Routes, Route } from 'react-router-dom';
import { PublicRoutes } from '../routes/PublicRoutes';
import { DispatcherRoutes } from '../routes/DispatcherRoutes';
import { AdminRoutes } from '../routes/AdminRoutes';
import { CitizenRoutes } from '../routes/CitizenRoutes';
import { RescueRoutes } from '../routes/RescueRoutes';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/*" element={<PublicRoutes />} />
      <Route path="/dispatcher/*" element={<DispatcherRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/citizen/*" element={<CitizenRoutes />} />
      <Route path="/rescue/*" element={<RescueRoutes />} />
    </Routes>
  );
};