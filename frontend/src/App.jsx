import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CommuterApp from './pages/CommuterApp';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        {/* No login — the map app is the landing page. */}
        <Route path="/*" element={<CommuterApp />} />
      </Routes>
    </BrowserRouter>
  );
}
