import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  ArrowLeft, Users, Brain, MapPin, AlertTriangle,
  BarChart3, LayoutDashboard, Menu, X,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'congestion', label: 'Congestion', icon: AlertTriangle },
  { key: 'accessibility', label: 'Accessibility', icon: MapPin },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [congestion, setCongestion] = useState(null);
  const [gaps, setGaps] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
    api.getCongestionSummary().then(setCongestion).catch(() => {});
    api.getAccessibilityGaps().then(setGaps).catch(() => {});
  }, []);

  const handleTab = (key) => {
    setActiveTab(key);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen h-dvh flex flex-col sm:flex-row bg-gray-50 overflow-hidden">
      {/* Mobile Top Bar */}
      <header className="sm:hidden h-12 glass flex items-center justify-between px-3 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-gray-900 text-sm">City Dashboard</h1>
        </div>
        <Link to="/" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 h-full glass-dark flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h1 className="text-lg font-bold text-white">Dashboard</h1>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleTab(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === item.key
                      ? 'bg-primary text-white'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex w-56 lg:w-64 glass-dark flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Link>
          <h1 className="text-lg font-bold text-white">City Dashboard</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.key
                  ? 'bg-primary text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-auto min-h-0">
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Platform Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <StatCard icon={Users} label="Active Users" value={stats?.active_users ?? '—'} color="blue" />
              <StatCard icon={Brain} label="Predictions Made" value={stats?.predictions_made ?? '—'} color="indigo" />
              <StatCard icon={MapPin} label="Locations Scanned" value={stats?.locations_scanned ?? '—'} color="emerald" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="glass rounded-xl p-4 sm:p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" /> Congestion Summary
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <p>Total predictions: <span className="font-mono font-bold">{congestion?.total_predictions ?? 0}</span></p>
                  <p>Severe congestion: <span className="font-mono font-bold text-danger">{congestion?.severe_congestion_count ?? 0}</span></p>
                  <p>Overall level: <span className="font-semibold capitalize">{congestion?.congestion_level ?? '—'}</span></p>
                </div>
              </div>
              <div className="glass rounded-xl p-4 sm:p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 shrink-0" /> Accessibility Coverage
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <p>Total locations: <span className="font-mono font-bold">{gaps?.total_locations ?? 0}</span></p>
                  <p>Low accessibility: <span className="font-mono font-bold text-danger">{gaps?.low_accessibility_count ?? 0}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'congestion' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Congestion Hotspots</h2>
            <div className="glass rounded-xl p-4 sm:p-5">
              <p className="text-gray-500 text-xs sm:text-sm">Heatmap visualization will be rendered here with live traffic prediction data.</p>
              <div className="mt-4 h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Accessibility Gaps</h2>
            <div className="glass rounded-xl p-4 sm:p-5">
              <p className="text-gray-500 text-xs sm:text-sm">Map showing areas with limited or no accessibility data will be displayed here.</p>
              <div className="mt-4 h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="glass rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className={`p-1.5 sm:p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className="text-xs sm:text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold font-mono text-gray-900">{value}</p>
    </div>
  );
}
