import React, { useEffect, useRef } from 'react';
import { Waypoint } from '../types/route';
import { MapPin } from 'lucide-react';

interface RouteMapProps {
  waypoints: Waypoint[];
}

const RouteMap: React.FC<RouteMapProps> = ({ waypoints }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!waypoints.length || !mapContainerRef.current) return;

    // In a real implementation, we would use a mapping library like Leaflet or Google Maps
    // Since we're creating a simple representation for now, we'll create a visual path
    
    const container = mapContainerRef.current;
    container.innerHTML = ''; // Clear previous content
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 1000 1000');
    svg.style.position = 'absolute';
    container.appendChild(svg);
    
    // Find min/max coordinates to scale the map
    const minLat = Math.min(...waypoints.map(w => w.lat));
    const maxLat = Math.max(...waypoints.map(w => w.lat));
    const minLng = Math.min(...waypoints.map(w => w.lng));
    const maxLng = Math.max(...waypoints.map(w => w.lng));
    
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    
    // Create a buffer around the edges
    const buffer = 0.1; // 10% buffer
    const scaledMinLat = minLat - latRange * buffer;
    const scaledMaxLat = maxLat + latRange * buffer;
    const scaledMinLng = minLng - lngRange * buffer;
    const scaledMaxLng = maxLng + lngRange * buffer;
    
    // Create scaling functions
    const scaleX = (lng: number) => 
      ((lng - scaledMinLng) / (scaledMaxLng - scaledMinLng)) * 1000;
    const scaleY = (lat: number) => 
      (1 - (lat - scaledMinLat) / (scaledMaxLat - scaledMinLat)) * 1000;
    
    // Create the path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Build the path data
    let pathData = `M ${scaleX(waypoints[0].lng)} ${scaleY(waypoints[0].lat)}`;
    for (let i = 1; i < waypoints.length; i++) {
      pathData += ` L ${scaleX(waypoints[i].lng)} ${scaleY(waypoints[i].lat)}`;
    }
    
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#3B82F6');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    
    // Create start and end markers
    const startPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    startPoint.setAttribute('cx', scaleX(waypoints[0].lng).toString());
    startPoint.setAttribute('cy', scaleY(waypoints[0].lat).toString());
    startPoint.setAttribute('r', '8');
    startPoint.setAttribute('fill', '#10B981');
    svg.appendChild(startPoint);
    
    const endPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    endPoint.setAttribute('cx', scaleX(waypoints[waypoints.length-1].lng).toString());
    endPoint.setAttribute('cy', scaleY(waypoints[waypoints.length-1].lat).toString());
    endPoint.setAttribute('r', '8');
    endPoint.setAttribute('fill', '#F97316');
    svg.appendChild(endPoint);
    
    // Add an overlay message
    const overlay = document.createElement('div');
    overlay.className = 'absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md';
    overlay.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="text-blue-500"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg></div>
        <span class="text-sm font-medium">Route visualization. Download GPX for full map usage.</span>
      </div>
    `;
    container.appendChild(overlay);
    
  }, [waypoints]);

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
    <div ref={mapContainerRef} className="relative w-full h-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse text-blue-500">
          <span className="sr-only">Loading map</span>
          <div className="h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;