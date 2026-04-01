import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Dispatcher/Home';
import { Incident } from '../pages/Dispatcher/Incident';
import {FleetManagement} from '../pages/Dispatcher/FleetManagement'
import { CallCenter } from '../pages/Dispatcher/CallCenter';
import { Settings } from '../pages/Dispatcher/Settings';

export const DispatcherRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Home />} />
      <Route path="incidents" element={<Incident />} />
      <Route path="fleet" element={<FleetManagement />} />
      <Route path="call-center" element={<CallCenter />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<div>Không tìm thấy trang Điều phối</div>} />
    </Routes>
  );
};