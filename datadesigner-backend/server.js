const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();



const app = express();
app.use(express.json()); // Middleware to parse JSON


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));


// Define Routes
app.use("/", require("./routes/testingRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/element", require("./routes/elementRoutes"));
app.use("/api/user", require("./routes/userRoutes"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
