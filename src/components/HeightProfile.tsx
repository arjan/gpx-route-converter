import React from "react";
import { Waypoint } from "../types/route";
import { TrendingUp } from "lucide-react";

interface HeightProfileProps {
  waypoints: Waypoint[];
}

const HeightProfile: React.FC<HeightProfileProps> = ({ waypoints }) => {
  if (!waypoints.length) return null;

  // Calculate dimensions and scaling factors
  const width = 800;
  const height = 200;
  const padding = 20;

  // Find min and max elevation
  const elevations = waypoints.map((w) => w.hoogte);
  const minElevation = Math.min(...elevations);
  const maxElevation = Math.max(...elevations);
  const elevationRange = maxElevation - minElevation;

  // Don't show profile if elevation range is too small
  if (elevationRange < 20) return null;

  // Calculate points for the path
  const points = waypoints.map((waypoint, index) => {
    const x =
      padding + (index / (waypoints.length - 1)) * (width - 2 * padding);
    const y =
      height -
      padding -
      ((waypoint.hoogte - minElevation) / elevationRange) *
        (height - 2 * padding);
    return `${x},${y}`;
  });

  // Create the path string
  const pathData = `M ${points.join(" L ")}`;

  // Calculate total ascent and descent
  let totalAscent = 0;
  let totalDescent = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const diff = waypoints[i].hoogte - waypoints[i - 1].hoogte;
    if (diff > 0) totalAscent += diff;
    else totalDescent += Math.abs(diff);
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <TrendingUp className="text-blue-500 mr-2" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">
          Elevation Profile
        </h3>
      </div>

      <div className="relative">
        <svg width={width} height={height} className="w-full">
          {/* Background grid */}
          <g stroke="#E5E7EB" strokeWidth="1">
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <line
                key={t}
                x1={padding}
                y1={padding + t * (height - 2 * padding)}
                x2={width - padding}
                y2={padding + t * (height - 2 * padding)}
              />
            ))}
          </g>

          {/* Filled area */}
          <defs>
            <linearGradient id="elevationGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L ${width - padding},${
              height - padding
            } L ${padding},${height - padding} Z`}
            fill="url(#elevationGradient)"
            stroke="none"
          />

          {/* Elevation line */}
          <path d={pathData} fill="none" stroke="#3B82F6" strokeWidth="2" />

          {/* Start and end points */}
          <circle
            cx={padding}
            cy={
              height -
              padding -
              ((waypoints[0].hoogte - minElevation) / elevationRange) *
                (height - 2 * padding)
            }
            r="4"
            fill="#3B82F6"
          />
          <circle
            cx={width - padding}
            cy={
              height -
              padding -
              ((waypoints[waypoints.length - 1].hoogte - minElevation) /
                elevationRange) *
                (height - 2 * padding)
            }
            r="4"
            fill="#3B82F6"
          />

          {/* Elevation labels */}
          <text
            x={padding - 5}
            y={padding}
            textAnchor="end"
            className="text-xs text-gray-500"
          >
            {maxElevation.toFixed(0)}m
          </text>
          <text
            x={padding - 5}
            y={height - padding}
            textAnchor="end"
            className="text-xs text-gray-500"
          >
            {minElevation.toFixed(0)}m
          </text>
        </svg>

        {/* Stats */}
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">Total Ascent:</span>{" "}
            {totalAscent.toFixed(0)}m
          </div>
          <div>
            <span className="font-medium">Total Descent:</span>{" "}
            {totalDescent.toFixed(0)}m
          </div>
          <div>
            <span className="font-medium">Min Elevation:</span>{" "}
            {minElevation.toFixed(0)}m
          </div>
          <div>
            <span className="font-medium">Max Elevation:</span>{" "}
            {maxElevation.toFixed(0)}m
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeightProfile;
