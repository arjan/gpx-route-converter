import React from 'react';
import { Bike, Map } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bike className="text-blue-500" size={24} />
            <span className="text-xl font-bold text-gray-800">RouteGPX</span>
          </div>
          <nav>
            <ul className="flex items-center space-x-6">
              <li>
                <a 
                  href="https://www.fietssport.nl/toertochten" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <Map className="mr-1" size={16} />
                  <span>Find Routes</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;