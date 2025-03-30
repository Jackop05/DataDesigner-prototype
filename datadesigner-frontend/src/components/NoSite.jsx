import React from "react";
import { useNavigate } from "react-router-dom";

const NoSite = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="m-0 p-0 h-screen max-h-screen flex flex-col justify-center">
        <div className=" bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4 py-32 px-52 max-h-screen max-w-[800px] mx-auto rounded-xl">
            <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                {/* Left side - Content */}
                <div className="w-full p-8 md:p-12 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h1>
                    <p className="text-gray-600">
                    The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                    <p className="text-gray-700">
                        You might want to check the URL or go back to the homepage.
                    </p>
                    </div>

                    <button
                    onClick={handleGoHome}
                    className="w-full py-3 px-4 cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                    Go Home
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Need help?</p>
                    <div className="flex justify-center space-x-4 mt-3">
                    <button className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer font-medium">
                        Contact Support
                    </button>
                    </div>  
                </div>
                </div>
            </div>
            </div>
    </div>
  );
};

export default NoSite;