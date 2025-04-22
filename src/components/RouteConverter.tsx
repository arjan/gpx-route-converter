import React, { useState } from "react";
import { AlertCircle, DownloadCloud, Loader, Check, Map } from "lucide-react";
import RouteMap from "./RouteMap";
import HeightProfile from "./HeightProfile";
import { generateGpxFile } from "../utils/gpxGenerator";
import { useRouteConverter } from "../hooks/useRouteConverter";

const RouteConverter: React.FC = () => {
  const {
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
  } = useRouteConverter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleDownloadGpx = () => {
    if (waypoints.length && routeInfo) {
      generateGpxFile(waypoints, routeInfo.name, selectedDistance);
    }
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
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-600">{item.url}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {routeInfo && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                {routeInfo.name}
              </h3>
              <button
                onClick={handleClearResults}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear results
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select distance
              </label>
              <div className="flex flex-wrap gap-2">
                {routeInfo.distances.map((distance) => (
                  <button
                    key={distance.distance}
                    onClick={() => handleDistanceChange(distance.distance)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      selectedDistance === distance.distance
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {distance.label}
                  </button>
                ))}
              </div>
            </div>

            {waypoints.length > 0 && (
              <div className="space-y-4">
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
                <button
                  onClick={handleDownloadGpx}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <DownloadCloud className="mr-2" size={18} />
                  Download GPX
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteConverter;
