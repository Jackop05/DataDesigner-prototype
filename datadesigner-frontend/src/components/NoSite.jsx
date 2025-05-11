import React from "react";
import { useNavigate } from "react-router-dom";

const NoSite = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="m-0 p-0 h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-cyan-100">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-12 flex flex-col md:flex-row">
        
        {/* Left side - Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
            <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or may have been moved.</p>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <p className="text-gray-700 mb-4">
              You might want to check the URL or go back to the homepage.
            </p>

            <button
              onClick={handleGoHome}
              className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go Home
            </button>

            <div className="mt-8 text-sm text-gray-500">
              <p>Need help?</p>
              <div className="flex justify-center md:justify-start space-x-4 mt-3">
                <button className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer font-medium">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Image Section (Optional) */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-500 to-cyan-400 relative">
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-white text-center">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">Oops!</h2>
              <p className="mb-6 text-sm lg:text-base opacity-90">
                This page isn't available. Let's get you back on track.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoSite;
