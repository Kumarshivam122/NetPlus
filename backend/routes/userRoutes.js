const express = require('express');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route GET /api/users
// Admin: Get all users
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}, { excludePassword: true });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/users/:id/status
// Admin: Update user status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const updatedUser = await User.update(req.params.id, {
        status: req.body.status || user.status,
      });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/users/:id
// Admin: Delete user
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete.role === 'admin' && req.user.email !== 'netplusenterprises@gmail.com') {
      return res.status(403).json({ message: 'Only the master admin (netplusenterprises@gmail.com) can delete other administrators' });
    }

    const success = await User.delete(req.params.id);
    if (success) {
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
