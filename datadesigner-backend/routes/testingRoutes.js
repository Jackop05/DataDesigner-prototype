const express = require("express");
const router = express.Router();


// Basic path
router.get("/", (req, res) => {
    res.send("Nothing to be seen here...");
});

// Testing of the application
router.get("/testing", (req, res) => {
    res.send("Everything is working just fine");
});



module.exports = router;