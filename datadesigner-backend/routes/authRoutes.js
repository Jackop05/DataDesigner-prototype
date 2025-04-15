const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post('/login', async (req, res) => {
  try { 
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      })
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No given user in database'
      })
    }

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("No JWT_SECRET found in .env file");
    }

    const jwt_token = jwt.sign(
      { 
        userId: user._id ,
        username: user.username,
        email: user.email,
        projects: user.projects
      },
      process.env.JWT_SECRET ,
      { expiresIn: '1h' }
    );

    res.cookie("jwt_token", jwt_token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 1000
    })

    res.json({
      success: true, 
      message: "Logged user successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false, 
      message: "Server error during login"
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password and username required' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      projects: []
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during register' 
    });
  }
});

router.post('/logout', async (req, res) => {
    try {       
      res.clearCookie("jwt_token", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
      });

      res.json({ 
        success: true, 
        message: "Logged out" 
      });

    } catch (error) {
      console.log(error);
        res.status(500).json({ 
          success: false, 
          message: 'Server error during logout' 
        });
    }
});

module.exports = router;