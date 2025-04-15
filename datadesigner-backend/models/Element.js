// Element model (models/Element.js)
const mongoose = require("mongoose");

const FieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  isPrimary: { type: Boolean, default: false }
});

const ElementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true, enum: ['table'] },
  name: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  fields: [FieldSchema],
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }
});

module.exports = mongoose.model("Element", ElementSchema);