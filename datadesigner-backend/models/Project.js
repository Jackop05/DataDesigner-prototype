// Project model (models/Project.js)
const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  elements: [{type: mongoose.Schema.Types.ObjectId, ref: "Elements"}],
  connections: [{type: mongoose.Schema.Types.ObjectId, ref: "Connections"}],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Project", ProjectSchema);