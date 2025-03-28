import React from "react";
import { FiFigma, FiGithub, FiTwitter, FiLinkedin, FiDribbble } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";

const Main = () => {
  const projects = [
    {
      id: 1,
      title: "Website Redesign",
      description: "Modern redesign for corporate website with improved UX",
      category: "UI/UX Design",
      color: "bg-purple-100"
    },
    {
      id: 2,
      title: "Mobile App",
      description: "Fitness tracking application with social features",
      category: "Mobile Development",
      color: "bg-blue-100"
    },
    {
      id: 3,
      title: "Brand Identity",
      description: "Complete visual identity for startup company",
      category: "Branding",
      color: "bg-green-100"
    },
    {
      id: 4,
      title: "Dashboard UI",
      description: "Analytics dashboard with customizable widgets",
      category: "UI Design",
      color: "bg-yellow-100"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FiFigma className="text-2xl text-purple-600" />
            <span className="text-xl font-semibold">DesignHub</span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Products</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Solutions</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Resources</a>
            <a href="#" className="text-gray-700 hover:text-purple-600 transition-colors">Pricing</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors">Log in</button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Design, collaborate, and bring ideas to life
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The modern platform for creative teams to work together in real-time. 
              Build beautiful interfaces faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                Get started <BsArrowRight className="ml-2" />
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Watch demo
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-inner">
              <div className="bg-white rounded-xl shadow-lg p-6 h-80 flex items-center justify-center">
                <div className="text-center">
                  <FiFigma className="mx-auto text-5xl text-purple-600 mb-4" />
                  <p className="text-gray-500">Your creative workspace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients/Logos */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-500 mb-8">TRUSTED BY TEAMS AT</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['Google', 'Microsoft', 'Airbnb', 'Spotify', 'Netflix', 'Amazon'].map((company) => (
              <div key={company} className="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Projects</h2>
            <p className="text-gray-600">Explore our latest creative work</p>
          </div>
          <button className="text-purple-600 hover:text-purple-800 flex items-center transition-colors">
            View all projects <BsArrowRight className="ml-2" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="group rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className={`h-48 ${project.color} flex items-center justify-center`}>
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <FiFigma className="text-2xl text-gray-700" />
                </div>
              </div>
              <div className="p-6 bg-white">
                <span className="text-sm text-purple-600 font-medium">{project.category}</span>
                <h3 className="text-xl font-semibold mt-2 mb-1 group-hover:text-purple-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600">{project.description}</p>
                <button className="mt-4 text-purple-600 hover:text-purple-800 flex items-center transition-colors">
                  View project <BsArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to bring your ideas to life?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of teams who use our platform to create amazing products together.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Get started for free
            </button>
            <button className="px-8 py-3 border border-white text-white rounded-lg hover:bg-purple-700 transition-colors">
              Contact sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FiFigma className="text-2xl text-purple-400" />
                <span className="text-xl font-semibold text-white">DesignHub</span>
              </div>
              <p className="mb-4">The modern platform for creative collaboration.</p>
              <div className="flex space-x-4">
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
            
            {['Product', 'Solutions', 'Resources', 'Company'].map((section) => (
              <div key={section}>
                <h4 className="text-white font-medium mb-4">{section}</h4>
                <ul className="space-y-2">
                  {Array(4).fill(0).map((_, i) => (
                    <li key={i}>
                      <a href="#" className="hover:text-white transition-colors">
                        {section} {i+1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p>© 2023 DesignHub. All rights reserved.</p>
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