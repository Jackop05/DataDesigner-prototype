// Connection model (models/Connection.js)
const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema({
  from: { type: String, required: true }, // elementId of source
  to: { type: String, required: true }, // elementId of target
  fromField: { type: String }, // fieldId of source field
  toField: { type: String }, // fieldId of target field
  type: { type: String, required: true },
  fromFieldName: { type: String },
  toFieldName: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }
});

module.exports = mongoose.model("Connection", ConnectionSchema);