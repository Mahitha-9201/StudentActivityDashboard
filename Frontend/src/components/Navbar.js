import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isPageViewsActive = [
    '/weekly-activity',
    '/compare-weekly-activity',
    '/download-reports',
    '/landing-page'
  ].includes(location.pathname);

  return (
    <div>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex space-x-8">
              <Link to="/" className="text-xl font-bold">
                Activity Project
              </Link>
              <div className="flex space-x-4">
                <Link 
                  to="/landing-page"
                  className={`px-3 py-2 rounded-md ${
                    isPageViewsActive 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Page Views
                </Link>
                <Link 
                  to="/participations"
                  className={`px-3 py-2 rounded-md ${
                    location.pathname === '/participations' 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Participations
                </Link>
                <Link 
                  to="/other-activity"
                  className={`px-3 py-2 rounded-md ${
                    location.pathname === '/other-activity' 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Other Activity
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isPageViewsActive && (
        <nav className="bg-gray-50 shadow-inner">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex h-12 items-center space-x-4">
            <Link 
                to="/landing-page"
                className={`px-3 py-1 rounded-md text-sm ${
                  location.pathname === '/landing-page' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:bg-white hover:shadow'
                }`}
              >
                Summary
              </Link>
              <Link 
                to="/weekly-activity"
                className={`px-3 py-1 rounded-md text-sm ${
                  location.pathname === '/weekly-activity' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:bg-white hover:shadow'
                }`}
              >
                Weekly Activity
              </Link>
              <Link 
                to="/compare-weekly-activity"
                className={`px-3 py-1 rounded-md text-sm ${
                  location.pathname === '/compare-weekly-activity' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:bg-white hover:shadow'
                }`}
              >
                Compare Activity
              </Link>
              <Link 
                to="/download-reports"
                className={`px-3 py-1 rounded-md text-sm ${
                  location.pathname === '/download-reports' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:bg-white hover:shadow'
                }`}
              >
                Download Reports
              </Link>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Navbar;