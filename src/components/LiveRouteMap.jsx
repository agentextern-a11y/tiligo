import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ScaleControl } from "react-leaflet";
import L from "leaflet";

const TILE_URL = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

const VEHICLE_EMOJI = { motor: "🛵", biciklete: "🚲", makine: "🚗" };

// Creates precise SVG pin for customer location (Wolt-style)
function customerIcon() {
  return L.divIcon({
    html: `<div style="position:relative;width:32px;height:40px">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 24 16 24S32 26.5 32 16C32 7.163 24.837 0 16 0z" fill="#009DE0"/>
        <circle cx="16" cy="16" r="7" fill="white"/>
        <circle cx="16" cy="16" r="4" fill="#009DE0"/>
      </svg>
    </div>`,
    className: "",
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

// Creates vehicle icon based on vehicle type
function vehicleIcon(vehicle) {
  const emoji = VEHICLE_EMOJI[vehicle] || "🛵";
  return L.divIcon({
    html: `<div style="position:relative">
      <div style="background:white;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 2px 12px rgba(0,0,0,0.25);border:3px solid #30C48D;">
        ${emoji}
      </div>
      <div style="width:8px;height:8px;background:#30C48D;border-radius:50%;position:absolute;bottom:-2px;right:0;border:2px solid white;animation:pulse 1.5s infinite;"></div>
    </div>
    <style>@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:0.5}}</style>`,
    className: "",
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });
}

// Auto-fit & live-follow driver
function MapController({ driverCoords, customerCoords, follow }) {
  const map = useMap();
  const initialFitDone = useRef(false);

  useEffect(() => {
    if (!driverCoords || !customerCoords) return;
    if (!initialFitDone.current) {
      const bounds = L.latLngBounds([driverCoords, customerCoords]).pad(0.3);
      map.fitBounds(bounds, { animate: true, duration: 1 });
      initialFitDone.current = true;
    } else if (follow) {
      map.panTo(driverCoords, { animate: true, duration: 0.8 });
    }
  }, [driverCoords?.[0], driverCoords?.[1]]);

  return null;
}

async function fetchRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      return {
        points: data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distanceM: data.routes[0].distance,
        durationS: data.routes[0].duration,
      };
    }
  } catch {}
  return { points: [from, to], distanceM: null, durationS: null };
}

function formatDistance(meters) {
  if (!meters) return null;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatETA(seconds) {
  if (!seconds) return null;
  const m = Math.ceil(seconds / 60);
  return `~${m} min`;
}

export default function LiveRouteMap({ driverCoords, customerCoords, customerName, customerAddress, vehicle }) {
  const [route, setRoute] = useState([]);
  const [distanceM, setDistanceM] = useState(null);
  const [durationS, setDurationS] = useState(null);
  const [followDriver, setFollowDriver] = useState(false);
  const prevDriverRef = useRef(null);

  useEffect(() => {
    if (!driverCoords || !customerCoords) return;
    const prev = prevDriverRef.current;
    const moved = !prev || Math.abs(prev[0] - driverCoords[0]) > 0.0001 || Math.abs(prev[1] - driverCoords[1]) > 0.0001;
    if (!moved && route.length) return;
    prevDriverRef.current = driverCoords;
    fetchRoute(driverCoords, customerCoords).then(r => {
      setRoute(r.points);
      setDistanceM(r.distanceM);
      setDurationS(r.durationS);
    });
  }, [driverCoords?.[0], driverCoords?.[1], customerCoords?.[0], customerCoords?.[1]]);

  if (!customerCoords) return null;
  const center = driverCoords || customerCoords;

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
      {/* Info bar */}
      {(distanceM || durationS) && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
          <div className="flex items-center gap-4 text-sm">
            {distanceM && (
              <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {formatDistance(distanceM)}
              </span>
            )}
            {durationS && (
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: "#30C48D" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#30C48D" }} />
                {formatETA(durationS)}
              </span>
            )}
          </div>
          <button
            onClick={() => setFollowDriver(f => !f)}
            className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
            style={followDriver
              ? { background: "#009DE0", color: "#fff" }
              : { background: "#F3F4F6", color: "#6B7280" }}>
            {followDriver ? "📡 Following" : "Follow"}
          </button>
        </div>
      )}

      <div style={{ height: 300 }}>
        <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}
          zoomControl={true} scrollWheelZoom={true}>
          <TileLayer url={TILE_URL} attribution="" maxZoom={19} />
          <ScaleControl position="bottomleft" imperial={false} metric={true} />

          {route.length > 0 && (
            <Polyline positions={route} pathOptions={{ color: "#009DE0", weight: 5, opacity: 0.95, lineCap: "round", lineJoin: "round" }} />
          )}

          <Marker position={customerCoords} icon={customerIcon()}>
            <Popup><strong>{customerName}</strong><br />{customerAddress}</Popup>
          </Marker>

          {driverCoords && (
            <Marker position={driverCoords} icon={vehicleIcon(vehicle)}>
              <Popup>Your location · Live GPS</Popup>
            </Marker>
          )}

          {driverCoords && <MapController driverCoords={driverCoords} customerCoords={customerCoords} follow={followDriver} />}
        </MapContainer>
      </div>
    </div>
  );
}