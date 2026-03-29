import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import ReportIncident from './pages/ReportIncident';
import Dashboard from './pages/Dashboard';
import RescuePanel from './pages/RescuePanel';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/dashboard">Dashboard</Link> |{" "}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportIncident />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rescue" element={<RescuePanel />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;