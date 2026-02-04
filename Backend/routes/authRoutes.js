const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const AllowedEmail = require('../models/AllowedEmail');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Google OAuth2 client for verifying ID tokens
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/google
// @desc    Login/Register via Google ID token — only if email exists in AllowedEmail
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) return res.status(400).json({ message: 'ID token required' });
    
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email;
    
    console.log(email);
    // Check if email is allowed
    const allowed = await AllowedEmail.findOne({ email });
    if (!allowed) {
      return res.status(403).json({ message: 'Email not authorized' });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(2);
      user = new User({
        name: payload.name || email.split('@')[0],
        email,
        password: randomPassword,
        role: 'student',
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Keep password login for existing users
// @route   POST /api/auth/login
// @desc    Login a user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
