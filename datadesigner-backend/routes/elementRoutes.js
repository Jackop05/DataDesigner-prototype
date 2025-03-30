const express = require("express");
const router = express.Router();
const Element = require("../models/Element");
const Connection = require("../models/Connection");
const Project = require("../models/Project");

// Helper function for error handling
const handleError = (res, error, statusCode = 500) => {
  console.error(error);
  res.status(statusCode).json({ 
    success: false, 
    message: error.message || 'An error occurred' 
  });
};

// Create new element
router.post('/post-new-element', async (req, res) => {
  try {
    const { projectId, name, position, backgroundColor, borderColor, attributes, fontSize, color } = req.body;

    // Create new element
    const newElement = new Element({
      name,
      position,
      backgroundColor,
      borderColor,
      attributes: attributes || [],
      connections: [],
      fontSize,
      color
    });

    const savedElement = await newElement.save();

    // Add element to project
    await Project.findByIdAndUpdate(
      projectId,
      { $push: { elements: savedElement._id } },
      { new: true }
    );

    res.status(201).json({ 
      success: true, 
      element: savedElement 
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Create new connection
router.post('/post-new-connection', async (req, res) => {
  try {
    const { positionsX, positionsY, color, elementId } = req.body;

    // Create new connection
    const newConnection = new Connection({
      positionsX,
      positionsY,
      color
    });

    const savedConnection = await newConnection.save();

    // Add connection to element
    if (elementId) {
      await Element.findByIdAndUpdate(
        elementId,
        { $push: { connections: savedConnection._id } },
        { new: true }
      );
    }

    res.status(201).json({ 
      success: true, 
      connection: savedConnection 
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Update element
router.put('/change-element/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedElement = await Element.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedElement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Element not found' 
      });
    }

    res.json({ 
      success: true, 
      element: updatedElement 
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Update connection
router.put('/change-connection/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { positionsX, positionsY, color } = req.body;

    const updatedConnection = await Connection.findByIdAndUpdate(
      id,
      { positionsX, positionsY, color },
      { new: true }
    );

    if (!updatedConnection) {
      return res.status(404).json({ 
        success: false, 
        message: 'Connection not found' 
      });
    }

    res.json({ 
      success: true, 
      connection: updatedConnection 
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Delete element
router.delete('/delete-element/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First find the element to get its connections
    const element = await Element.findById(id);
    if (!element) {
      return res.status(404).json({ 
        success: false, 
        message: 'Element not found' 
      });
    }

    // Delete all associated connections
    await Connection.deleteMany({ _id: { $in: element.connections } });

    // Remove element from any projects
    await Project.updateMany(
      { elements: id },
      { $pull: { elements: id } }
    );

    // Finally delete the element
    await Element.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: 'Element and its connections deleted successfully' 
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Delete connection
router.delete('/delete-connection/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Remove connection from elements
    await Element.updateMany(
      { connections: id },
      { $pull: { connections: id } }
    );

    // Delete the connection
    const deletedConnection = await Connection.findByIdAndDelete(id);

    if (!deletedConnection) {
      return res.status(404).json({ 
        success: false, 
        message: 'Connection not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Connection deleted successfully' 
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;