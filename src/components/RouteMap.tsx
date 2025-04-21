import React, { useEffect, useRef, useState } from "react";
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
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isHovering?: boolean;
}

// Component to handle map bounds updates and animated dot
const MapBoundsUpdater: React.FC<{
  waypoints: Waypoint[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isHovering?: boolean;
}> = ({ waypoints, currentIndex, onIndexChange, isHovering }) => {
  const map = useMap();
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (waypoints.length > 0) {
      const bounds = waypoints.reduce((acc, waypoint) => {
        return acc.extend([waypoint.lat, waypoint.lng]);
      }, L.latLngBounds([waypoints[0].lat, waypoints[0].lng], [waypoints[0].lat, waypoints[0].lng]));

      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 });
    }
  }, [waypoints, map]);

  // Animate the dot
  useEffect(() => {
    if (waypoints.length <= 1 || isHovered || isHovering) return;

    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      if (deltaTime >= 50) {
        // Only update every 50ms (20fps)
        onIndexChange((currentIndex + 1) % waypoints.length);
        lastTime = currentTime;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waypoints.length, isHovered, isHovering, currentIndex, onIndexChange]);

  // Create a custom icon for the moving dot
  const movingDotIcon = L.divIcon({
    className: "moving-dot",
    html: '<div class="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  // Find the closest waypoint to a given latlng
  const findClosestWaypoint = (latlng: L.LatLng): number => {
    let closestIndex = 0;
    let minDistance = Infinity;

    waypoints.forEach((waypoint, index) => {
      const distance = latlng.distanceTo(L.latLng(waypoint.lat, waypoint.lng));
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  // Handle polyline hover events
  const handleMouseOver = (e: L.LeafletMouseEvent) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsHovered(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    const closestIndex = findClosestWaypoint(e.latlng);
    onIndexChange(closestIndex);
  };

  const handleMouseMove = (e: L.LeafletMouseEvent) => {
    if (isHovered) {
      const closestIndex = findClosestWaypoint(e.latlng);
      onIndexChange(closestIndex);
    }
  };

  const handleMouseOut = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      timeoutRef.current = null;
    }, 10000);
  };

  return (
    <>
      <Polyline
        positions={waypoints.map((w) => [w.lat, w.lng])}
        pathOptions={{
          color: "#3B82F6",
          weight: 5,
        }}
        eventHandlers={{
          mouseover: handleMouseOver,
          mousemove: handleMouseMove,
          mouseout: handleMouseOut,
        }}
      />
      {currentIndex < waypoints.length && (
        <Marker
          position={[waypoints[currentIndex].lat, waypoints[currentIndex].lng]}
          icon={movingDotIcon}
          eventHandlers={{
            mouseover: handleMouseOver,
            mouseout: handleMouseOut,
          }}
        />
      )}
    </>
  );
};

const RouteMap: React.FC<RouteMapProps> = ({
  waypoints,
  currentIndex,
  onIndexChange,
  isHovering,
}) => {
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

  return (
    <MapContainer
      center={[waypoints[0].lat, waypoints[0].lng]}
      zoom={14}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      <MapBoundsUpdater
        waypoints={waypoints}
        currentIndex={currentIndex}
        onIndexChange={onIndexChange}
        isHovering={isHovering}
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
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
