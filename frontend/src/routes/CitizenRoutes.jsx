import { Routes, Route } from 'react-router-dom';
import {CitizenDashboard} from '../pages/Citizen/DashBoard'
import { IncidentReport } from '../pages/Citizen/IncidentReport'
import { CitizenHistory } from '../pages/Citizen/CitizenHistory'
import { CitizenNotifications } from '../pages/Citizen/Notifications'
import { CitizenSOS } from '../pages/Citizen/SOS'
import { CitizenAccount } from '../pages/Citizen/Account';

export const CitizenRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<CitizenDashboard />} />
      <Route path="report" element={<IncidentReport />} />
      <Route path="history" element={<CitizenHistory />} />
      <Route path="notifications" element={<CitizenNotifications />} />
      <Route path="sos" element={<CitizenSOS />} />
      <Route path="account" element={<CitizenAccount />} />
    </Routes>
  );
};