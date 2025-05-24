
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Workflow } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">WorkflowHub</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-purple-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/marketplace" 
              className={`text-sm font-medium transition-colors ${
                isActive('/marketplace') 
                  ? 'text-purple-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Marketplace
            </Link>
            <Link 
              to="/graph-editor" 
              className={`text-sm font-medium transition-colors ${
                isActive('/graph-editor') 
                  ? 'text-purple-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Graph Editor
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-purple-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              About
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">Sign In</Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
