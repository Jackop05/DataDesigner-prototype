const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const jwt = require('jsonwebtoken');
const User = require('../models/User');



router.get('/get-user-data', async (req, res) => {
  try {
    const token = req.cookies.jwt_token;
    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token found on the website"
      })
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("No JWT_SECRET found in .env file");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      res.status(403).json({
        success: false,
        message: "Token is not valid"
      })
    }

    const userId = decodedToken.userId;
    const user = await User.findById(userId) 
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      })
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
      message: "New blank project created"
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
    const token = req.cookies.jwt_token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("No JWT_SECRET found in .env file");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(403).json({
        success: false,
        message: "Invalid token"
      });
    }

    const userId = decodedToken.userId;
    const { projectId } = req.params;

    // Verify access
    const user = await User.findOne({ _id: userId, projects: projectId });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Fetch the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Manually get each element
    const rawElements = await Promise.all(
      project.elements.map(async (elementId) => {
        const element = await require('../models/Element').findById(elementId);
        if (!element) return null;

        // Manually get each connection for the element
        const connections = await Promise.all(
          element.connections.map(async (connId) => {
            const connection = await require('../models/Connection').findById(connId);
            return connection ? {
              id: connection._id,
              positionsX: connection.positionsX,
              positionsY: connection.positionsY,
              color: connection.color
            } : null;
          })
        );

        return {
          id: element._id,
          name: element.name,
          position: element.position,
          backgroundColor: element.backgroundColor,
          borderColor: element.borderColor,
          attributes: element.attributes,
          fontSize: element.fontSize,
          color: element.color,
          connections: connections.filter(c => c !== null)
        };
      })
    );

    const finalProject = {
      id: project._id,
      elements: rawElements.filter(e => e !== null),
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