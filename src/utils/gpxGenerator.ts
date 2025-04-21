import { Waypoint } from '../types/route';

/**
 * Generates a GPX file from waypoints and triggers download
 */
export const generateGpxFile = (waypoints: Waypoint[], routeName: string): void => {
  // Create GPX content
  const gpxContent = generateGpxContent(waypoints, routeName);
  
  // Create a blob from the GPX content
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  
  // Create a download URL
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element to trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${routeName.replace(/\s+/g, '_')}.gpx`;
  
  // Append the link to the body
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates GPX XML content from waypoints
 */
const generateGpxContent = (waypoints: Waypoint[], routeName: string): string => {
  const currentDate = new Date().toISOString();
  
  // GPX header
  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RouteGPX Converter" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(routeName)}</name>
    <time>${currentDate}</time>
  </metadata>
  <trk>
    <name>${escapeXml(routeName)}</name>
    <trkseg>
`;
  
  // Add track points
  waypoints.forEach(waypoint => {
    gpx += `      <trkpt lat="${waypoint.lat}" lon="${waypoint.lng}">
        <ele>${waypoint.hoogte || 0}</ele>
      </trkpt>\n`;
  });
  
  // Close GPX structure
  gpx += `    </trkseg>
  </trk>
</gpx>`;
  
  return gpx;
};

/**
 * Escapes XML special characters
 */
const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};