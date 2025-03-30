const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
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
        message: 'All fields are required' 
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

    // Create token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

router.post('/logout', verifyToken, async (req, res) => {
    try {
        // Get the current token from headers
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
        return res.status(400).json({ 
            success: false, 
            message: 'No token provided' 
        });
        }

        // Create a replacement token that expires in 1 second
        const replacementToken = jwt.sign(
        { userId: req.userId, invalidated: true },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1s' }  // Expires immediately
        );

        // You might want to store invalidated tokens in Redis/DB
        // for additional security in a production environment

        res.json({ 
        success: true, 
        message: 'Logged out successfully',
        token: replacementToken  // Send the replacement token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
        success: false, 
        message: 'Server error during logout' 
        });
    }
});

module.exports = router;