const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// Helper function for error handling
const handleError = (res, error, statusCode = 500) => {
  console.error(error);
  res.status(statusCode).json({ 
    success: false, 
    message: error.message || 'An error occurred' 
  });
};

// Get authenticated user's data
// Add auth middleware to protect route
// Import required modules
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.get('/get-user-data', async (req, res) => {
  console.log('working')
  try {
    // 1. Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // 2. Decode token to get userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    // 3. Fetch user data using the decoded userId
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'projects',
        select: '_id name description', // Include necessary fields
        options: { sort: { createdAt: -1 } }
      });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // 4. Return user data
    res.json({ 
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        projects: user.projects,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error(error);
    
    // Handle different error cases
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get project data with all its elements and connections
router.get('/get-project-data/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify the user has access to this project
    const user = await User.findOne({ 
      _id: req.userId, 
      projects: projectId 
    });

    if (!user) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access to project' 
      });
    }

    // Get full project data with populated elements and connections
    const project = await Project.findById(projectId)
      .populate({
        path: 'elements',
        populate: {
          path: 'connections',
          model: 'Connection'
        }
      });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    res.json({ 
      success: true, 
      project: {
        id: project._id,
        elements: project.elements.map(element => ({
          id: element._id,
          name: element.name,
          position: element.position,
          backgroundColor: element.backgroundColor,
          borderColor: element.borderColor,
          attributes: element.attributes,
          connections: element.connections.map(connection => ({
            id: connection._id,
            positionsX: connection.positionsX,
            positionsY: connection.positionsY,
            color: connection.color
          })),
          fontSize: element.fontSize,
          color: element.color
        })),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;