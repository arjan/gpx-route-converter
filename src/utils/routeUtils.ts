import { Waypoint } from '../types/route';

/**
 * Extracts the route ID from a fietssport.nl URL
 */
export const parseRouteIdFromUrl = (url: string): string | null => {
  try {
    // Try to parse using regex
    const regex = /\/toertochten\/(\d+)\//;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    // If regex fails, try to parse URL path
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    
    // Find the segment that contains only digits
    for (const segment of pathSegments) {
      if (/^\d+$/.test(segment)) {
        return segment;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing route ID:', error);
    return null;
  }
};

/**
 * Fetches waypoints for a route from our server-side API endpoint
 */
export const fetchRouteWaypoints = async (routeId: string): Promise<Waypoint[]> => {
  try {
    const response = await fetch(`${window.location.origin}/api/routeWaypoints/${routeId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate that we got waypoints array
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected array of waypoints');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching waypoints from server:', error);
    
    // Check if the error is likely due to the server not running
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to the server. Please make sure the server is running by executing "node server/index.js" in a terminal window.');
    }
    
    throw error instanceof Error 
      ? error 
      : new Error('Unknown error occurred while fetching route data');
  }
};