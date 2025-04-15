const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema({
  positionsX: [{ type: Number, required: true }],
  positionsY: [{ type: Number, required: true }],
  color: { type: String, required: true },
});

module.exports = mongoose.model("Connection", ConnectionSchema);
