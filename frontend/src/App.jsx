import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import CommuterApp from './pages/CommuterApp';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';

export default function App() {
  const token = useStore((s) => s.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/*" element={token ? <CommuterApp /> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}
