import { useState } from "react";
import { Waypoint } from "../types/route";
import {
  fetchRouteWaypoints,
  parseRouteIdFromUrl,
  fetchRouteInfo,
} from "../utils/routeUtils";

interface RouteDistance {
  distance: string;
  label: string;
}

interface RouteInfo {
  id: string;
  name: string;
  distances: RouteDistance[];
}

export const useRouteConverter = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [recentUrls, setRecentUrls] = useState<{ url: string; date: string }[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<string>("100");

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!url.includes("fietssport.nl/toertochten/")) {
      setError("Please enter a valid fietssport.nl toertocht URL");
      return;
    }

    const routeId = parseRouteIdFromUrl(url);

    if (!routeId) {
      setError("Could not parse route ID from URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const routeInfo = await fetchRouteInfo(routeId);

      setRouteInfo({
        id: routeId,
        name: extractRouteName(url),
        distances: routeInfo.distances,
      });

      const firstDistance = routeInfo.distances[0].distance;
      setSelectedDistance(firstDistance);

      const data = await fetchRouteWaypoints(routeId, firstDistance);
      setWaypoints(data);

      const newRecentUrl = { url, date: new Date().toLocaleString() };
      setRecentUrls((prev) => [newRecentUrl, ...prev.slice(0, 4)]);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch route data. Please check the URL and try again.";

      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDistanceChange = async (distance: string) => {
    if (!routeInfo) return;

    setLoading(true);
    setSelectedDistance(distance);

    try {
      const data = await fetchRouteWaypoints(routeInfo.id, distance);
      setWaypoints(data);
    } catch (err) {
      console.error("Error fetching waypoints for distance:", err);
    } finally {
      setLoading(false);
    }
  };

  const extractRouteName = (url: string): string => {
    try {
      const pathSegments = new URL(url).pathname.split("/");
      const lastSegment = pathSegments[pathSegments.length - 1];
      return (
        lastSegment.charAt(0).toUpperCase() +
        lastSegment.slice(1).replace(/-/g, " ")
      );
    } catch {
      return "Cycling Route";
    }
  };

  const handleClearResults = () => {
    setWaypoints([]);
    setRouteInfo(null);
  };

  return {
    url,
    setUrl,
    loading,
    error,
    waypoints,
    routeInfo,
    recentUrls,
    selectedDistance,
    handleUrlChange,
    handleConvert,
    handleDistanceChange,
    handleClearResults,
  };
}; 