const express = require('express');
const router = express.Router();
const Element = require('../models/Element');
const Connection = require('../models/Connection');
const Project = require('../models/Project');

router.post('/:projectId/post-project-data', async (req, res) => {
  try {
    const { elements, connections } = req.body;
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Update timestamp
    project.updatedAt = new Date();

    // Track updated references
    const newElementIds = [];
    const newConnectionIds = [];

    // Fetch existing elements and connections
    const existingElements = await Element.find({ project: projectId });
    const existingConnections = await Connection.find({ project: projectId });

    const existingElementIds = existingElements.map(el => el.id);
    const existingConnectionPairs = existingConnections.map(conn => `${conn.from}-${conn.to}`);

    // --- Handle Elements ---
    for (let element of elements) {
      let found = await Element.findOne({ id: element.id, project: projectId });
      if (found) {
        Object.assign(found, element);
        await found.save();
        newElementIds.push(found._id);
      } else {
        const newElement = new Element({ ...element, project: projectId });
        await newElement.save();
        newElementIds.push(newElement._id);
      }
    }

    // Delete removed elements
    const incomingElementIds = elements.map(el => el.id);
    const elementsToDelete = existingElements.filter(el => !incomingElementIds.includes(el.id));
    if (elementsToDelete.length > 0) {
      await Element.deleteMany({
        _id: { $in: elementsToDelete.map(el => el._id) }
      });
    }

    // --- Handle Connections ---
    for (let connection of connections) {
      const key = `${connection.from}-${connection.to}`;
      let found = await Connection.findOne({ from: connection.from, to: connection.to, project: projectId });
      if (found) {
        Object.assign(found, connection);
        await found.save();
        newConnectionIds.push(found._id);
      } else {
        const newConnection = new Connection({ ...connection, project: projectId });
        await newConnection.save();
        newConnectionIds.push(newConnection._id);
      }
    }

    // Delete removed connections
    const incomingKeys = connections.map(conn => `${conn.from}-${conn.to}`);
    const connectionsToDelete = existingConnections.filter(conn => !incomingKeys.includes(`${conn.from}-${conn.to}`));
    if (connectionsToDelete.length > 0) {
      await Connection.deleteMany({
        _id: { $in: connectionsToDelete.map(conn => conn._id) }
      });
    }

    // Update project references
    project.elements = newElementIds;
    project.connections = newConnectionIds;

    await project.save();

    res.json({ msg: 'Project data saved successfully', elements, connections });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
