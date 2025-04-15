const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  elements: [{type: mongoose.Schema.Types.ObjectId, ref: "Elements"}],
});

module.exports = mongoose.model("Project", ProjectSchema);
