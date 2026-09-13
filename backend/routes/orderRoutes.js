const express = require('express');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route POST /api/orders
// Submit new order
router.post('/', protect, async (req, res) => {
  try {
    const { items, note, discountCode, discountAmount, totalAmount } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (totalAmount < 1500) {
      return res.status(400).json({ message: 'Minimum order amount must be at least RS.1500' });
    }

    const order = await Order.create({
      orderId: 'ORD-' + Date.now(),
      userId: req.user._id,
      userName: req.user.storeName || req.user.ownerName || req.user.name,
      items,
      note,
      discountCode,
      discountAmount,
      totalAmount
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/orders
// Admin: Get all orders
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/orders/myorders
// Get logged in user orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user._id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/orders/:id/status
// Admin: Update order status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      const updatedOrder = await Order.updateStatus(req.params.id, req.body.status);
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/orders/:id/cancel
// Cancel an order (Retailer if pending, Admin anytime)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const updatedOrder = await Order.cancelOrder(req.params.id, req.user.role, req.user._id);
    res.json(updatedOrder);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('cannot be cancelled')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
