const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import CORS
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Enable CORS for all routes (or restrict to your frontend origin)
app.options("*", cors({
  origin: "https://schemai.online",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://schemai.online");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(cookieParser());
app.use(express.json()); 

// Rest of your code...
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Define Routes
app.use("/", require("./routes/testingRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/element", require("./routes/elementRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

const PORT = process.env.PORT || 4321;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));