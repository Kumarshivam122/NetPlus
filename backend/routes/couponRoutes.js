const express = require('express');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route GET /api/coupons
// Admin: Get all coupons
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/coupons/active
// Retailer: Get all active and visible coupons
router.get('/active', protect, async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true, isVisible: true });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/coupons
// Admin: Create a new coupon
router.post('/', protect, admin, async (req, res) => {
  try {
    const existing = await Coupon.findByCode(req.body.code);
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/coupons/:id
// Admin: Update a coupon
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updated = await Coupon.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/coupons/:id
// Admin: Delete a coupon
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const success = await Coupon.delete(req.params.id);
    if (success) {
      res.json({ message: 'Coupon deleted' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/coupons/validate
// Retailer: Validate a specific code
router.post('/validate', protect, async (req, res) => {
  try {
    const coupon = await Coupon.findByCode(req.body.code);
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
