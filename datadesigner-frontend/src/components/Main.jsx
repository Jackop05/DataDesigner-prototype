import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiFigma, FiGithub, FiTwitter, FiLinkedin, FiDribbble } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";
import axios from "axios";

const Main = () => {
  const [data, setData] = useState(null); // Store user data (projects, etc.)
  const [loading, setLoading] = useState(true); // For loading state
  const [projects, setProjects] = useState([]); // For storing user's projects
  const [newProjectName, setNewProjectName] = useState(""); // For new project input field
  const aboutRef = useRef(null);
  const projectsRef = useRef(null);
  const navigate = useNavigate();

  // Fetch the user's data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/get-user-data`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        }
      });
      console.log("Fetched data:", response.data);
      setData(response.data);
      setProjects(response.data.projects || []); // Set user projects from fetched data
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    setData(null); // Clear data on logout
    setProjects([]); // Clear projects on logout
    navigate("/");
  };

  // Function to create a new project
  const handleCreateNewProject = async () => {
    if (!newProjectName) return alert("Please provide a project name.");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/new-project`,
        { projectName: newProjectName },
        { withCredentials: true }
      );
      if (response.data.success) {
        alert("New project created successfully!");
        fetchUserData(); // Refresh the projects list
        setNewProjectName(""); // Clear input field
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error creating new project:", error);
    }
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
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
                <button onClick={handleLogout} className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors cursor-pointer">
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
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">Plan, design, and bring ideas to life</h1>
            <p className="text-xl text-gray-600 mb-8">The modern platform for database design and collaboration with easy interface.</p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Link to={data ? "/project" : "/register"} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
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
          {data && (
            <div className="flex items-center">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="New project name"
                className="px-4 py-2 border border-gray-300 rounded-lg mr-4"
              />
              <button
                onClick={handleCreateNewProject}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add New Project
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.length === 0 ? (
              <p>No projects found. Start by creating one!</p>
            ) : (
              projects.map((project) => (
                <Link
                  to={`/project/${project._id}`}
                  key={project._id}
                  className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="h-48 bg-purple-100 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                      <FiFigma className="text-2xl text-gray-700" />
                    </div>
                  </div>
                  <div className="p-6 bg-white">
                    <span className="text-sm text-purple-600 font-medium">Database Design</span>
                    <h3 className="text-xl font-semibold mt-2 mb-1 group-hover:text-purple-600 transition-colors">
                      {project.projectName}
                    </h3>
                    <p className="text-gray-600">{project.description}</p>
                    <button className="mt-4 text-purple-600 hover:text-purple-800 flex items-center transition-colors cursor-pointer">
                      Open project <BsArrowRight className="ml-2" />
                    </button>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
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
        </div>
      </footer>
    </div>
  );
};

export default Main;
