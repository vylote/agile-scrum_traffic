import { Routes, Route, Navigate } from 'react-router-dom';
import { RescueHome } from '../pages/Rescue/RescueHome'
import { History } from '../pages/Rescue/History'
import { Chat } from '../pages/Rescue/Chat'
import { Settings } from '../pages/Rescue/Settings'

export const RescueRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<RescueHome />} />
      <Route path="history" element={<History />} />
      <Route path="messages" element={<Chat />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
  );
};