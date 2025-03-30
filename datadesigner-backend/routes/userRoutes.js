const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Project = require("../models/Project");
const { verifyToken } = require("../middleware/auth"); // Assuming you have auth middleware

// Helper function for error handling
const handleError = (res, error, statusCode = 500) => {
  console.error(error);
  res.status(statusCode).json({ 
    success: false, 
    message: error.message || 'An error occurred' 
  });
};

// Get authenticated user's data
router.get('/get-user-data', verifyToken, async (req, res) => {
  try {
    // Get user data excluding password
    const user = await User.findById(req.userId)
      .select('-password')
      .populate({
        path: 'projects',
        select: '_id', // Only get project IDs
        options: { sort: { createdAt: -1 } } // Sort by newest first
      });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

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
    handleError(res, error);
  }
});

// Get project data with all its elements and connections
router.get('/get-project-data/:projectId', verifyToken, async (req, res) => {
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