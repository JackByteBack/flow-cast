import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ROUTE_COLORS = {
  fast: '#2563EB',
  green: '#10B981',
  reliable: '#F59E0B',
  accessible: '#8B5CF6',
};

function LocationMarker({ position, label, color = '#2563EB' }) {
  if (!position) return null;
  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={L.divIcon({
        className: '',
        html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:bold;">${label}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })}
    />
  );
}

function MapClickHandler({ onOriginSelect, onDestSelect, clickMode, setClickMode }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (clickMode === 'origin') {
        onOriginSelect({ lat, lng });
        setClickMode('dest');
      } else {
        onDestSelect({ lat, lng });
        setClickMode('origin');
      }
    },
  });
  return null;
}

function FitBounds({ origin, destination }) {
  const map = useMap();
  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds([origin.lat, origin.lng], [destination.lat, destination.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [origin, destination, map]);
  return null;
}

function ZoomControl() {
  const map = useMap();
  useEffect(() => {
    const control = L.control.zoom({ position: 'bottomright' });
    control.addTo(map);
    return () => control.remove();
  }, [map]);
  return null;
}

function parseRouteGeometry(geometry) {
  try {
    const geo = typeof geometry === 'string' ? JSON.parse(geometry) : geometry;
    return geo.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch {
    return [];
  }
}

export default function MapView({ origin, destination, onOriginSelect, onDestSelect, routes }) {
  const [clickMode, setClickMode] = useState('origin');

  return (
    <div className="absolute inset-0">
      {/* Instruction Badge */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-[1000] glass rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-gray-600 max-w-[160px] sm:max-w-none">
        Tap map to set {clickMode === 'origin' ? 'origin' : 'destination'}
      </div>

      <MapContainer
        center={[6.5244, 3.3792]}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
        touchZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler
          onOriginSelect={onOriginSelect}
          onDestSelect={onDestSelect}
          clickMode={clickMode}
          setClickMode={setClickMode}
        />
        <ZoomControl />
        {origin && destination && <FitBounds origin={origin} destination={destination} />}

        <LocationMarker position={origin} label="O" color="#22C55E" />
        <LocationMarker position={destination} label="D" color="#EF4444" />

        {routes.map((route, i) => (
          <Polyline
            key={`${route.rank}-${i}`}
            positions={parseRouteGeometry(route.geometry)}
            pathOptions={{
              color: ROUTE_COLORS[route.rank] || '#2563EB',
              weight: window.innerWidth < 640 ? 4 : (route.rank === 'fast' ? 5 : 3),
              opacity: 0.85,
              dashArray: route.rank === 'accessible' ? '8 6' : undefined,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
