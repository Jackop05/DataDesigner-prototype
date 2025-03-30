const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema({
  positionsX: [{ type: Integer, required: true }],
  positionsY: [{ type: Integer, required: true }],
  color: { type: String, required: true },
});

module.exports = mongoose.model("Connection", ConnectionSchema);
