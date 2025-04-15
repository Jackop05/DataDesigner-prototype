const mongoose = require("mongoose");

const ElementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: [{ type: Number, required: true }],
  backgroundColor: { type: String, required: true },
  borderColor: { type: String, required: true },
  attributes: [{ type: String, required: true }],
  connections: [{type: mongoose.Schema.Types.ObjectId, ref: "Connections"}],
  fontSize: { type: Number, required: true },
  color: { type: String, required: true },
});

module.exports = mongoose.model("Element", ElementSchema);
