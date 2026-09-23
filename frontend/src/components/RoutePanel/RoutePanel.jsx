import { Zap, Leaf, Shield, Accessibility, Clock, Leaf as LeafIcon } from 'lucide-react';

const PRIORITIES = [
  { key: 'fast', label: 'Fast', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'green', label: 'Green', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'reliable', label: 'Reliable', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'accessible', label: 'Accessible', icon: Accessibility, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const RANK_META = {
  fast: { label: 'Fast Route', icon: Zap, color: 'text-blue-600', card: 'route-card-fast' },
  green: { label: 'Green Route', icon: Leaf, color: 'text-emerald-600', card: 'route-card-green' },
  reliable: { label: 'Reliable Route', icon: Shield, color: 'text-amber-600', card: 'route-card-reliable' },
  accessible: { label: 'Accessible Route', icon: Accessibility, color: 'text-purple-600', card: 'route-card-accessible' },
};

export default function RoutePanel({ origin, destination, priority, onPriorityChange, onCalculate, loading, routes }) {
  return (
    <div className="h-full flex flex-col bg-white sm:bg-transparent">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">Route Planner</h2>

        {/* Origin/Destination Status */}
        <div className="space-y-1.5 mb-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
            <span className={`truncate ${origin ? 'text-gray-900' : 'text-gray-400'}`}>
              {origin ? `${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}` : 'Tap map to set origin'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
            <span className={`truncate ${destination ? 'text-gray-900' : 'text-gray-400'}`}>
              {destination ? `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}` : 'Tap map to set destination'}
            </span>
          </div>
        </div>

        {/* Priority Selector — 2x2 grid on mobile, 4-col on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3">
          {PRIORITIES.map((p) => (
            <button
              key={p.key}
              onClick={() => onPriorityChange(p.key)}
              className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                priority === p.key
                  ? `${p.bg} ${p.color} ring-2 ring-offset-1 ring-current`
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <p.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={onCalculate}
          disabled={!origin || !destination || loading}
          className="w-full py-2.5 sm:py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Calculating...' : 'Find Routes'}
        </button>
      </div>

      {/* Route Results */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3">
        {routes.length === 0 ? (
          <div className="text-center text-gray-400 text-xs sm:text-sm py-6 sm:py-8">
            Tap map to set origin & destination, then find routes
          </div>
        ) : (
          routes.map((route) => {
            const meta = RANK_META[route.rank] || RANK_META.fast;
            const Icon = meta.icon;
            return (
              <div key={route.rank} className={`route-card ${meta.card} p-3 sm:p-4`}>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${meta.color}`} />
                    <span className="font-semibold text-gray-900 text-sm">{meta.label}</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold font-mono text-gray-900">{route.travel_time} min</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate">+{route.delay} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LeafIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate">{route.emissions} kg CO₂</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Accessibility className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="truncate">{route.accessibility_score}/10</span>
                  </div>
                </div>
                <div className="mt-1.5 text-[10px] sm:text-xs text-gray-400">{route.distance_km} km</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
