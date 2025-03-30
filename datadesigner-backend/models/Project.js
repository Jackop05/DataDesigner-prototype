const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  elements: [{type: mongoose.Schema.Types.ObjectId, ref: "Elements"}],
});

module.exports = mongoose.model("Project", ProjectSchema);
