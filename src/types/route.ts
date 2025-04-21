/**
 * Represents a single waypoint in a route
 */
export interface Waypoint {
  lat: number;
  lng: number;
  hoogte: number;
}

/**
 * Represents a cycling route
 */
export interface Route {
  id: string;
  name: string;
  waypoints: Waypoint[];
}