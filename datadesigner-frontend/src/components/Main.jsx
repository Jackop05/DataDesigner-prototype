import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiFigma, FiGithub, FiTwitter, FiLinkedin, FiDribbble } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";
import axios from "axios";

const Main = () => {
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const aboutRef = useRef(null);
  const projectsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/get-user-data`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": "true"
        }
      });
      setData(response.data.data);
      setProjects(response.data.data.projects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setData(null);
    setProjects(null);
    navigate('/');
  };

  const handleNewProject = async () => {
    try {
      const projectName = prompt("Enter a name for your new project:");
      if (!projectName) return;
  
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/new-project`,
        { projectName },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
  
      if (response.data.success) {
        fetchUserData();
        navigate(`/project/${response.data.projectId}`);
      }
    } catch (error) {
      console.error('Error creating new project:', error);
      alert('Failed to create new project');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - Improved for mobile */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FiFigma className="text-xl sm:text-2xl text-purple-600" />
            <span className="text-lg sm:text-xl font-semibold cursor-default">DataDesigner</span>
          </div>
          
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            <button onClick={() => scrollToSection(aboutRef)} className="text-sm lg:text-base text-gray-700 hover:text-purple-600 transition-colors">About Us</button>
            <button onClick={() => scrollToSection(projectsRef)} className="text-sm lg:text-base text-gray-700 hover:text-purple-600 transition-colors">Projects</button>          
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {data ? (
              <button 
                onClick={handleLogout}
                className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-700 hover:text-purple-600 transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-700 hover:text-purple-600 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Better mobile layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20" ref={aboutRef}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6">
              Plan, design, and bring ideas to life
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
              The modern platform for database design and collaboration with easy interface.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div 
                onClick={() => scrollToSection(projectsRef)} 
                className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center cursor-pointer"
              >
                {data ? "Go to Projects" : "Get started"} <BsArrowRight className="ml-2" />
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-inner">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6 h-64 sm:h-80 flex items-center justify-center">
                <div className="text-center">
                  <FiFigma className="mx-auto text-4xl sm:text-5xl text-purple-600 mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500">Your database design workspace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Better mobile spacing */}
      <section className="bg-gray-50 py-8 sm:py-12 rounded-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">DESIGN YOUR DATABASE WITH EASE</p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-16">
            {['Data Models', 'Schema Design', 'Entity Relationships', 'SQL Generation', 'Team Collaboration']?.map((feature) => (
              <div key={feature} className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section - Improved grid and cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20" ref={projectsRef}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {data ? "Your Projects" : "Example Projects"}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {data ? "Explore your database designs" : "See what you can create"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {projects?.map((project) => (
              <Link 
                to={data ? `/project/${project._id}` : "/register"} 
                key={project._id} 
                className="group rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md sm:shadow-md sm:hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className={`h-40 sm:h-48 ${project.color || 'bg-gray-100'} flex items-center justify-center`}>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <FiFigma className="text-xl sm:text-2xl text-gray-700" />
                  </div>
                </div>
                <div className="p-4 sm:p-6 bg-white">
                  <span className="text-xs sm:text-sm text-purple-600 font-medium">{project.category || 'Database Project'}</span>
                  <h3 className="text-lg sm:text-xl font-semibold mt-1 sm:mt-2 mb-1 group-hover:text-purple-600 transition-colors">
                    {project.projectName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{project.description || 'No description provided.'}</p>
                  <button className="mt-3 sm:mt-4 text-sm sm:text-base text-purple-600 hover:text-purple-800 flex items-center transition-colors cursor-pointer">
                    {data ? "Open project" : "Sign up to create"} <BsArrowRight className="ml-1 sm:ml-2" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section - Better mobile padding */}
      <section className="bg-purple-600 text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            {data ? "Ready to design your next database?" : "Ready to start designing?"}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-6 sm:mb-8">
            {data ? "Create professional database schemas with your team." : "Join thousands of developers who design databases with our platform."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={data ? handleNewProject : () => navigate('/register')}
              className="px-6 py-2 sm:px-8 sm:py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium flex cursor-pointer mx-auto text-sm sm:text-base"
            >
              {data ? "Create New Project" : "Start for free"} <BsArrowRight className="ml-2 self-center" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Better mobile layout */}
      <footer className="bg-gray-900 text-gray-400 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center mb-8 sm:mb-12">
            <div className="flex justify-center items-center space-x-2 mb-3 sm:mb-4">
              <FiFigma className="text-xl sm:text-2xl text-purple-400" />
              <span className="text-lg sm:text-xl font-semibold text-white">DataDesigner</span>
            </div>
            <p className="text-center text-sm sm:text-base mb-3 sm:mb-4 max-w-md">The modern platform for database design and collaboration.</p>
            <div className="flex justify-center space-x-3 sm:space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiTwitter className="text-lg sm:text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiGithub className="text-lg sm:text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiLinkedin className="text-lg sm:text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiDribbble className="text-lg sm:text-xl" />
              </a>
            </div>
          </div>
          
          <div className="pt-6 sm:pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs sm:text-sm">© {new Date().getFullYear()} DataDesigner. All rights reserved.</p>
            <div className="flex space-x-4 sm:space-x-6 mt-3 sm:mt-4 md:mt-0">
              <a href="#" className="text-xs sm:text-sm hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-xs sm:text-sm hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-xs sm:text-sm hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Main;