import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for development
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:5173'
  }));
}

// API Routes - must be before the proxy middleware
app.get('/api/routeInfo/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    
    if (!routeId) {
      return res.status(400).json({ error: 'Route ID is required' });
    }
    
    console.log(`Fetching route info for: ${routeId}`);
    
    const apiUrl = `https://www.fietssport.nl/toertochten/${routeId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'text/html',
        'accept-language': 'nl,en-US;q=0.9,en;q=0.8'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status} - ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML to extract distances
    const distances = [];
    const regex = /data-afstabd="(\d+)">\s*(\d+)\s*km/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      distances.push({
        distance: match[1],
        label: `${match[2]} km`
      });
    }
    
    // If no distances found, add default 100km
    if (distances.length === 0) {
      distances.push({
        distance: '100',
        label: '100 km'
      });
    }
    
    res.json({ distances });
  } catch (error) {
    console.error('Error fetching route info:', error);
    res.status(500).json({ 
      error: 'Failed to fetch route info',
      message: error.message 
    });
  }
});

app.get('/api/routeWaypoints/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { distance = '100' } = req.query;
    
    if (!routeId) {
      return res.status(400).json({ error: 'Route ID is required' });
    }
    
    console.log(`Fetching waypoints for route: ${routeId} with distance: ${distance}`);
    
    const apiUrl = `https://www.fietssport.nl/apisite/waypoints/ride/${routeId}/${distance}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'accept-language': 'nl,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        routeId: routeId,
        distance: distance
      })
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate that we got waypoints array
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected array of waypoints');
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching route waypoints:', error);
    res.status(500).json({ 
      error: 'Failed to fetch route data',
      message: error.message 
    });
  }
});

// Development mode - proxy to Vite dev server
if (process.env.NODE_ENV !== 'production') {
  app.use(createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    ws: true, // Enable WebSocket proxying
  }));
} else {
  // Production mode - serve static files
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});