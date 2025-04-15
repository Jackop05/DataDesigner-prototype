const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import CORS
require("dotenv").config();

const app = express();

// Enable CORS for all routes (or restrict to your frontend origin)
app.use(cors({
  origin: "http://localhost:5173", // Allow only your frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  credentials: true, // Allow cookies (if needed)
}));

app.use(express.json()); // Middleware to parse JSON

// Rest of your code...
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Define Routes
app.use("/", require("./routes/testingRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/element", require("./routes/elementRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));