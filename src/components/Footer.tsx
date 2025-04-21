import React from 'react';
import { Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} RouteGPX - Convert cycling routes to GPX</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2">Made with</span>
              <Heart className="text-red-500" size={16} />
              <span className="ml-2">for cyclists</span>
            </div>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;