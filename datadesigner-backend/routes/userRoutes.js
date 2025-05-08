const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const jwt = require('jsonwebtoken');
const User = require('../models/User');



router.get('/get-user-data', async (req, res) => {
  try {
    const token = req.cookies.jwt_token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found on the website"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("No JWT_SECRET found in .env file");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(403).json({
        success: false,
        message: "Token is not valid"
      });
    }

    const userId = decodedToken.userId;

    // ✅ Populate project data (id, projectName, createdAt)
    const user = await User.findById(userId).populate({
      path: 'projects',
      select: '_id projectName createdAt'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userData = {
      username: user.username,
      email: user.email,
      projects: user.projects,
      _id: user._id
    };

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while getting user data"
    });
  }
});


router.post('/new-project', async (req, res) => {
  try {
    const { projectName } = req.body;
    if (!projectName) {
      return res.status(401).json({
        success: false,
        message: "ProjectnName is missing"
      });
    }

    const token = req.cookies.jwt_token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Create a blank project
    const newProject = new Project({
      projectName,
      elements: []
    });
    await newProject.save();

    // Add project to user's list
    user.projects.push(newProject._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "New blank project created",
      projectId: newProject._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while creating new project"
    });
  }
});


router.get('/get-project-data/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const Project = require('../models/Project');
    const Element = require('../models/Element');
    const Connection = require('../models/Connection');

    // Fetch project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Get all elements in the project
    const elements = await Element.find({ _id: { $in: project.elements } });

    // Get all connections in the project
    const connections = await Connection.find({ _id: { $in: project.connections } });

    // Format elements
    const formattedElements = elements.map(el => ({
      id: el.id,
      type: el.type,
      name: el.name,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      fields: el.fields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
        isPrimary: field.isPrimary
      }))
    }));

    // Format connections
    const formattedConnections = connections.map(conn => ({
      id: conn._id,
      from: conn.from,
      to: conn.to,
      type: conn.type,
      label: conn.label,
      color: conn.color,
      positionsX: conn.positionsX,
      positionsY: conn.positionsY,
      strokeWidth: conn.strokeWidth,
      dashStyle: conn.dashStyle,
      arrowStart: conn.arrowStart,
      arrowEnd: conn.arrowEnd,
      metadata: conn.metadata || {}
    }));

    const finalProject = {
      id: project._id,
      name: project.name,
      description: project.description,
      elements: formattedElements,
      connections: formattedConnections,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };

    res.json({
      success: true,
      project: finalProject
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while getting project data"
    });
  }
});



module.exports = router;