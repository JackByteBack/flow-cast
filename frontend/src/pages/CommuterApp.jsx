import { useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import MapView from '../components/Map/MapView';
import RoutePanel from '../components/RoutePanel/RoutePanel';
import BarrierLensUpload from '../components/BarrierLens/BarrierLensUpload';
import { LayoutDashboard, Camera, Route, ChevronUp, ChevronDown } from 'lucide-react';

export default function CommuterApp() {
  const { routes, setRoutes } = useStore();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [priority, setPriority] = useState('fast');
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const handleCalculate = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    try {
      const data = await api.calculateRoutes({
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        dest_lat: destination.lat,
        dest_lng: destination.lng,
        priority,
      });
      setRoutes(data.routes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen h-dvh flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 sm:h-14 glass flex items-center justify-between px-3 sm:px-4 z-[1000] relative shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Route className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm sm:text-base">FlowCast</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto">
          <button
            onClick={() => setShowUpload(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="BarrierLens Upload"
          >
            <Camera className="w-5 h-5 text-gray-600" />
          </button>
          <a
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
            title="City Dashboard"
          >
            <LayoutDashboard className="w-5 h-5 text-gray-600" />
          </a>
        </div>
      </header>

      {/* Map — fills remaining space */}
      <div className="flex-1 relative min-h-0">
        <MapView
          origin={origin}
          destination={destination}
          onOriginSelect={setOrigin}
          onDestSelect={setDestination}
          routes={routes}
        />

        {/* Mobile: Bottom Sheet Panel */}
        <div className="sm:hidden absolute bottom-0 left-0 right-0 z-20">
          {/* Drag Handle / Toggle */}
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="w-full flex flex-col items-center py-2 glass rounded-t-2xl"
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mb-1" />
            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
              {panelOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              {routes.length > 0 ? `${routes.length} routes found` : 'Route Planner'}
            </div>
          </button>

          {/* Sheet Content */}
          <div
            className={`glass rounded-t-2xl transition-all duration-300 overflow-hidden ${
              panelOpen ? 'max-h-[70vh]' : 'max-h-0'
            }`}
          >
            <div className="overflow-y-auto max-h-[70vh]">
              <RoutePanel
                origin={origin}
                destination={destination}
                priority={priority}
                onPriorityChange={setPriority}
                onCalculate={handleCalculate}
                loading={loading}
                routes={routes}
              />
            </div>
          </div>
        </div>

        {/* Desktop: Side Panel */}
        <div className="hidden sm:block absolute top-0 right-0 bottom-0 z-20">
          <div
            className={`h-full transition-all duration-300 overflow-hidden ${
              panelOpen ? 'w-96' : 'w-0'
            }`}
          >
            <RoutePanel
              origin={origin}
              destination={destination}
              priority={priority}
              onPriorityChange={setPriority}
              onCalculate={handleCalculate}
              loading={loading}
              routes={routes}
            />
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full glass p-2 rounded-l-lg z-10"
          >
            {panelOpen ? (
              <ChevronDown className="w-4 h-4 rotate-90" />
            ) : (
              <ChevronUp className="w-4 h-4 -rotate-90" />
            )}
          </button>
        </div>
      </div>

      {/* BarrierLens Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/40">
          <div className="glass rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[85vh] overflow-y-auto">
            <BarrierLensUpload onClose={() => setShowUpload(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
