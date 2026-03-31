import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Dispatcher/Home';
import { Incident } from '../pages/Dispatcher/Incident';
import Login from '../pages/Auth/Login'
import {FleetManagement} from '../pages/Dispatcher/FleetManagement'
import { CallCenter } from '../pages/Dispatcher/CallCenter';

export const DispatcherRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="dashboard" element={<Home />} />
      <Route path="incidents" element={<Incident />} />
      <Route path="fleet" element={<FleetManagement />} />
      <Route path="call-center" element={<CallCenter />} />
      
      <Route path="*" element={<div>Không tìm thấy trang Điều phối</div>} />
    </Routes>
  );
};