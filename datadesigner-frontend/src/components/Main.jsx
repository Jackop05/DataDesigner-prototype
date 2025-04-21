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
          // You might need to add this if you're dealing with CORS and credentials
          "Access-Control-Allow-Credentials": "true"
        }
      });
      console.log("data: ", response.data);
      setData(response.data.data);
      if (response.data.data?.projects) {
        fetchProjects(response.data.data.projects);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const projectsData = await Promise.all(
        data?.projects?.map(async (id) => {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user//get-project-data/${id}`, {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              // You might need to add this if you're dealing with CORS and credentials
              "Access-Control-Allow-Credentials": "true"
            }
          });
          return response.data.project;
        })
      );
      setProjects(projectsData);
      console.log(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setData(null);
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
        // Refresh the projects list
        fetchUserData();
        // Optionally navigate to the new project
        navigate(`/project/${response.data.projectId}`);
      }
    } catch (error) {
      console.error('Error creating new project:', error);
      alert('Failed to create new project');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FiFigma className="text-2xl text-purple-600" />
            <span className="text-xl font-semibold cursor-default">DataDesigner</span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection(aboutRef)} className="cursor-pointer text-gray-700 hover:text-purple-600 transition-colors">About Us</button>
            <button onClick={() => scrollToSection(projectsRef)} className="cursor-pointer text-gray-700 hover:text-purple-600 transition-colors">Projects</button>          
          </div>
          
          <div className="flex items-center space-x-4">
            {data ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors cursor-pointer">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors cursor-pointer">
                  Log in
                </Link>
                <Link to="/register" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20" ref={aboutRef}>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Plan, design, and bring ideas to life
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The modern platform for database design and collaboration with easy interface.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Link 
                to={data ? "/project" : "/register"} 
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                {data ? "Go to Projects" : "Get started"} <BsArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-inner">
              <div className="bg-white rounded-xl shadow-lg p-6 h-80 flex items-center justify-center">
                <div className="text-center">
                  <FiFigma className="mx-auto text-5xl text-purple-600 mb-4" />
                  <p className="text-gray-500">Your database design workspace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-12 rounded-xl">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-500 mb-8">DESIGN YOUR DATABASE WITH EASE</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['Data Models', 'Schema Design', 'Entity Relationships', 'SQL Generation', 'Team Collaboration']?.map((feature) => (
              <div key={feature} className="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="max-w-7xl mx-auto px-6 py-20" ref={projectsRef}>
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-left">
              {data ? "Your Projects" : "Example Projects"}
            </h2>
            <p className="text-gray-600">
              {data ? "Explore your database designs" : "See what you can create"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.map((project) => (
              <Link 
                to={data ? `/project/${project.id}` : "/register"} 
                key={project.id} 
                className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className={`h-48 ${project.color || 'bg-gray-100'} flex items-center justify-center`}>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <FiFigma className="text-2xl text-gray-700" />
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <span className="text-sm text-purple-600 font-medium">{project.category || 'Database Project'}</span>
                  <h3 className="text-xl font-semibold mt-2 mb-1 group-hover:text-purple-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-gray-600">{project.description}</p>
                  <button className="mt-4 text-purple-600 hover:text-purple-800 flex items-center transition-colors cursor-pointer">
                    {data ? "Open project" : "Sign up to create"} <BsArrowRight className="ml-2" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {data ? "Ready to design your next database?" : "Ready to start designing?"}
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            {data ? "Create professional database schemas with your team." : "Join thousands of developers who design databases with our platform."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={data ? handleNewProject : () => navigate('/register')}
              className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium flex cursor-pointer mx-auto"
            >
              {data ? "Create New Project" : "Start for free"} <BsArrowRight className="ml-2 self-center" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center gap-8 mb-12">
            <div>
              <div className="flex justify-center items-center space-x-2 mb-4">
                <FiFigma className="text-2xl text-purple-400" />
                <span className="text-xl font-semibold text-white">DataDesigner</span>
              </div>
              <p className="mb-4">The modern platform for database design and collaboration.</p>
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiTwitter className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiGithub className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiLinkedin className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiDribbble className="text-xl" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} DataDesigner. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Main;