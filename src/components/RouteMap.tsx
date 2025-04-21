import React, { useEffect, useRef } from "react";
import { Waypoint } from "../types/route";
import { MapPin } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Vite
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface RouteMapProps {
  waypoints: Waypoint[];
}

// Custom animated polyline component
const AnimatedPolyline: React.FC<{ positions: LatLngTuple[] }> = ({
  positions,
}) => {
  const map = useMap();
  const polylineRef = useRef<L.Polyline | null>(null);
  const animationRef = useRef<number | null>(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    if (!polylineRef.current) return;

    const animate = () => {
      offsetRef.current = (offsetRef.current - 0.1) % 30;
      polylineRef.current?.setStyle({
        dashOffset: offsetRef.current.toString(),
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: "#3B82F6",
        weight: 5,
        dashArray: "10, 8",
      }}
      ref={(ref) => {
        if (ref) {
          polylineRef.current = ref;
        }
      }}
    />
  );
};

// Component to handle map bounds updates
const MapBoundsUpdater: React.FC<{ waypoints: Waypoint[] }> = ({
  waypoints,
}) => {
  const map = useMap();

  useEffect(() => {
    if (waypoints.length > 0) {
      const bounds = waypoints.reduce((acc, waypoint) => {
        return acc.extend([waypoint.lat, waypoint.lng]);
      }, L.latLngBounds([waypoints[0].lat, waypoints[0].lng], [waypoints[0].lat, waypoints[0].lng]));

      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 });
    }
  }, [waypoints, map]);

  return null;
};

const RouteMap: React.FC<RouteMapProps> = ({ waypoints }) => {
  if (!waypoints.length) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 flex flex-col items-center">
          <MapPin size={48} className="mb-2 opacity-30" />
          <p>Enter a route URL to see the map</p>
        </div>
      </div>
    );
  }

  // Create polyline positions
  const positions: LatLngTuple[] = waypoints.map(
    (waypoint) => [waypoint.lat, waypoint.lng] as LatLngTuple
  );

  return (
    <MapContainer
      center={[waypoints[0].lat, waypoints[0].lng]}
      zoom={14}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      <MapBoundsUpdater waypoints={waypoints} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AnimatedPolyline positions={positions} />
      <Marker position={[waypoints[0].lat, waypoints[0].lng]}>
        <Popup>Start</Popup>
      </Marker>
      <Marker
        position={[
          waypoints[waypoints.length - 1].lat,
          waypoints[waypoints.length - 1].lng,
        ]}
      >
        <Popup>End</Popup>
      </Marker>
    </MapContainer>
  );
};

export default RouteMap;
