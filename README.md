# GPX Toertochten Converter

A web application that converts cycling routes from [fietssport.nl](https://www.fietssport.nl) to GPX format. This allows you to download cycling routes and use them with your GPS device or cycling computer.

## Features

- Convert fietssport.nl cycling routes to GPX format
- Interactive map view of the route
- Elevation profile visualization
- Support for multiple route distances
- Recent conversions history
- Beautiful and responsive UI

## Tech Stack

- React + TypeScript
- Tailwind CSS for styling
- Leaflet for map visualization
- Vite for build tooling
- Express.js for production server
- Docker for containerization

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm
- Docker (optional)

### Installation

#### Local Development

1. Clone the repository:
```bash
git clone https://github.com/arjan/gpx-route-converter.git
cd gpx-route-converter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

#### Local Build

```bash
npm run build
```

The built files will be in the `dist` directory.

#### Docker Deployment

1. Build the production image:
```bash
docker build -t gpx-toertochten-prod .
```

2. Run the production container:
```bash
docker run -p 3000:3000 gpx-toertochten-prod
```

3. Open your browser and navigate to `http://localhost:3000`

The application is served by an Express.js server on port 3000 in both development and production environments.

## Usage

1. Go to [fietssport.nl](https://www.fietssport.nl) and find a cycling route you want to convert
2. Copy the URL of the route
3. Paste the URL into the converter
4. Select your preferred distance if multiple options are available
5. Click "Download GPX" to save the route to your device

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 
