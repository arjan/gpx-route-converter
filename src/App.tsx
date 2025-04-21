import React from 'react';
import { Bike } from 'lucide-react';
import RouteConverter from './components/RouteConverter';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-500 text-white rounded-full mb-4">
              <Bike size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Cycling Route Converter</h1>
            <p className="text-lg text-gray-600">
              Convert your favorite fietssport.nl routes to GPX files for your GPS device
            </p>
          </div>
          <RouteConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;