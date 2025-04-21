import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";




const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true } // 👈 Critical for cookies
      );

      // No need to handle tokens manually - they're in cookies!
      // Just save user data if needed
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen max-h-screen flex flex-col justify-center overflow-y-hidden mx-0">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center py-32 rounded-xl m-0">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col m-0 md:flex-row">
          {/* Left side - Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to DataDesigner</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
                  Email 
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer transition-colors">
                    Forgot password?
                  </span>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isLoading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin "></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Or continue with</p>
              <div className="flex justify-center space-x-4 mt-3">
                <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.672-4.166-2.698-6.735-2.698-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.67-0.069-1.325-0.201-1.961h-9.799z"></path>
                  </svg>
                </button>
                <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                </button>
                <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-500 to-cyan-400 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="text-white text-center">
                <h2 className="text-3xl font-bold mb-4">New here?</h2>
                <p className="mb-6 opacity-90">
                  Sign up and discover a great community of like-minded people!
                </p>
                <Link to="/register" className="px-6 py-2 border-2 border-white rounded-full text-white font-medium hover:bg-white hover:text-blue-600 transition-colors cursor-pointer">
                  Sign Up
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-blue-400 opacity-20"></div>
            <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-cyan-400 opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;