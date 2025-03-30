import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';

import Login from "./components/Loign";
import Register from './components/Resgister';
import Main from './components/Main';
import Project from './components/Project';
import NoSite from './components/NoSite';



function App() {
  return (
    <div className='gidole p-0 m-0'>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Main />} />
          <Route path="/project" element={<Project />} />
          <Route path="/*" element={<NoSite />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
