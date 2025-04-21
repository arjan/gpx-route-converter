import React from "react";
import RouteConverter from "./components/RouteConverter";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <RouteConverter />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
