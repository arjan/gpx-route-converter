import React, { useState } from "react";
import { AlertCircle, DownloadCloud, Loader, Check, Map } from "lucide-react";
import RouteMap from "./RouteMap";
import HeightProfile from "./HeightProfile";
import {
  fetchRouteWaypoints,
  parseRouteIdFromUrl,
  fetchRouteInfo,
} from "../utils/routeUtils";
import { generateGpxFile } from "../utils/gpxGenerator";
import { Waypoint } from "../types/route";

interface RouteDistance {
  distance: string;
  label: string;
}

const RouteConverter: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [routeInfo, setRouteInfo] = useState<{
    id: string;
    name: string;
    distances: RouteDistance[];
  } | null>(null);
  const [recentUrls, setRecentUrls] = useState<{ url: string; date: string }[]>(
    []
  );
  const [selectedDistance, setSelectedDistance] = useState<string>("100");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

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
      // Fetch route info and available distances
      const routeInfo = await fetchRouteInfo(routeId);

      setRouteInfo({
        id: routeId,
        name: extractRouteName(url),
        distances: routeInfo.distances,
      });

      // Select the first available distance
      const firstDistance = routeInfo.distances[0].distance;
      setSelectedDistance(firstDistance);

      // Fetch waypoints for the first available distance
      const data = await fetchRouteWaypoints(routeId, firstDistance);
      setWaypoints(data);

      // Add to recent URLs
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
      // The last segment should be the route name
      const lastSegment = pathSegments[pathSegments.length - 1];
      return (
        lastSegment.charAt(0).toUpperCase() +
        lastSegment.slice(1).replace(/-/g, " ")
      );
    } catch {
      return "Cycling Route";
    }
  };

  const handleDownloadGpx = () => {
    if (waypoints.length && routeInfo) {
      generateGpxFile(waypoints, routeInfo.name, selectedDistance);
    }
  };

  const handleClearResults = () => {
    setWaypoints([]);
    setRouteInfo(null);
  };

  const handlePasteExample = () => {
    setUrl("https://www.fietssport.nl/toertochten/56186/bultentocht");
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Convert Route to GPX
        </h2>

        <form onSubmit={handleConvert} className="mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow relative">
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="Enter fietssport.nl route URL (e.g. https://www.fietssport.nl/toertochten/56186/bultentocht)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {error && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                  <AlertCircle size={18} />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader className="animate-spin mr-2" size={18} />
              ) : (
                <Map className="mr-2" size={18} />
              )}
              Convert
            </button>
          </div>
          {error && (
            <p className="mt-2 text-red-500 text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" /> {error}
            </p>
          )}
          <div className="mt-2 text-sm text-gray-500">
            <button
              type="button"
              onClick={handlePasteExample}
              className="text-blue-500 hover:underline"
            >
              Use example URL
            </button>
          </div>
        </form>

        {recentUrls.length > 0 && !waypoints.length && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Recent conversions
            </h3>
            <div className="space-y-2">
              {recentUrls.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <div className="truncate flex-grow">
                    <span className="font-medium">{item.url}</span>
                  </div>
                  <button
                    onClick={() => setUrl(item.url)}
                    className="text-blue-500 hover:text-blue-700 ml-2"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {waypoints.length > 0 && routeInfo && (
          <div className="mt-8 animation-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  {routeInfo.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {waypoints.length} waypoints found
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleDownloadGpx}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center"
                >
                  <DownloadCloud size={18} className="mr-2" />
                  Download GPX
                </button>
                <button
                  onClick={handleClearResults}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {routeInfo.distances.length > 1 && (
              <div className="mb-4">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {routeInfo.distances.map(({ distance, label }) => (
                    <button
                      key={distance}
                      onClick={() => handleDistanceChange(distance)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedDistance === distance
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-100 rounded-lg overflow-hidden h-80 md:h-96">
              <RouteMap
                waypoints={waypoints}
                currentIndex={currentIndex}
                onIndexChange={setCurrentIndex}
                isHovering={isHovering}
              />
            </div>

            <HeightProfile
              waypoints={waypoints}
              currentIndex={currentIndex}
              onIndexChange={setCurrentIndex}
              onHoverChange={setIsHovering}
            />

            <div className="mt-4 text-sm text-gray-600">
              <p className="flex items-center">
                <Check size={16} className="mr-2 text-green-500" />
                Route data successfully retrieved and converted. Use the
                download button to save as GPX.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteConverter;
