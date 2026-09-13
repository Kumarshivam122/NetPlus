const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { sendOTPEmail, sendWelcomeEmail, sendVerificationEmail } = require('../utils/email');
const pool = require('../db/pool');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
      name,
      email,
      password,
      role: 'retailer',
      status: 'unverified'
    });

    if (user) {
      // Save the OTP using the reset_otp fields for verification
      await pool.query(
        'UPDATE users SET reset_otp = $1, reset_otp_expiry = $2 WHERE id = $3',
        [otp, otpExpiry, user._id]
      );

      // Send verification email
      sendVerificationEmail(user.email, otp).catch(console.error);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Validate request
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const { rows } = await pool.query(
      'SELECT id, reset_otp, reset_otp_expiry, name FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    // Check if OTP matches and hasn't expired
    if (user.reset_otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.reset_otp_expiry)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // OTP is valid, mark as onboarding and clear OTP
    await pool.query(
      "UPDATE users SET status = 'onboarding', reset_otp = NULL, reset_otp_expiry = NULL WHERE id = $1",
      [user.id]
    );

    // Send the welcome email since they are now fully registered
    sendWelcomeEmail(email, user.name).catch(console.error);

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await User.matchPassword(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/auth/me
// Get current logged in user
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id, { excludePassword: true });
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @route PUT /api/auth/profile
// Complete onboarding
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const updateData = {};

      // Map request body fields
      const fields = [
        'storeName', 'storeType', 'licenceNo', 'gstin',
        'storeAddress', 'city', 'state', 'pincode',
        'ownerName', 'phone', 'alternatePhone',
        'licenceFileName', 'licenceFileUrl',
        'shopPhotoName', 'shopPhotoUrl',
        'gstinFileName', 'gstinFileUrl'
      ];

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      // When onboarding is complete, status goes to pending
      if (user.status === 'onboarding') {
        updateData.status = 'pending';
      }

      const updatedUser = await User.update(user._id, updateData);
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await User.saveOtp(email, otp, expiry);
    
    const emailSent = await sendOTPEmail(email, otp);
    if (emailSent) {
      res.json({ message: 'OTP sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    if (new Date() > new Date(user.resetOtpExpiry)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    if (new Date() > new Date(user.resetOtpExpiry)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    await User.updatePassword(email, newPassword);
    await User.clearOtp(email);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
