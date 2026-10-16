const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const { sendContactEmail, sendRequestEmail } = require('../utils/email');
const { protect, admin } = require('../middleware/authMiddleware');

// @route POST /api/queries/contact
// Public: Submit contact form message
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // 1. Persist enquiry into database / system storage
    const enquiry = await Enquiry.create({
      type: 'contact',
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim()
    });

    // 2. Dispatch email notification to admin asynchronously
    sendContactEmail({ name, email, phone, subject, message }).catch(err => {
      console.error('Asynchronous contact email dispatch note:', err);
    });

    res.json({
      success: true,
      message: 'Your message has been sent successfully! Our support team will get in touch soon.',
      enquiry
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/queries/request
// Retailer / Public: Submit medicine request
router.post('/request', async (req, res) => {
  try {
    const { medicineName, email, phone, notes, userId, userName, pharmacyName, dlNumber } = req.body;
    
    if (!medicineName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // 1. Persist medicine request into database / system storage
    const enquiry = await Enquiry.create({
      type: 'medicine_request',
      medicineName: medicineName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notes: (notes || '').trim(),
      userId: userId || null,
      userName: userName || null,
      pharmacyName: (pharmacyName || '').trim() || null,
      dlNumber: (dlNumber || '').trim() || null
    });

    // 2. Dispatch email notification to admin asynchronously
    sendRequestEmail({ 
      medicineName, 
      email, 
      phone, 
      notes, 
      userName, 
      pharmacyName, 
      dlNumber 
    }).catch(err => {
      console.error('Asynchronous medicine request email dispatch note:', err);
    });

    res.json({
      success: true,
      message: 'Medicine request submitted successfully! Our procurement team will review and contact you.',
      enquiry
    });
  } catch (error) {
    console.error('Request submit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/queries
// Admin: Fetch all queries and requests
router.get('/', protect, admin, async (req, res) => {
  try {
    const list = await Enquiry.find(req.query || {});
    res.json(list);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/queries/:id/status
// Admin: Update query status
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const updated = await Enquiry.updateStatus(req.params.id, req.body.status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/queries/:id
// Admin: Delete query
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Enquiry.delete(req.params.id);
    res.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
