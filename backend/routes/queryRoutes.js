const express = require('express');
const router = express.Router();
const { sendContactEmail, sendRequestEmail } = require('../utils/email');

// @route POST /api/queries/contact
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const emailSent = await sendContactEmail(req.body);
    
    if (emailSent) {
      res.json({ success: true, message: 'Message sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send message' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/queries/request
router.post('/request', async (req, res) => {
  try {
    const { medicineName, email, phone, notes } = req.body;
    
    if (!medicineName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const emailSent = await sendRequestEmail(req.body);
    
    if (emailSent) {
      res.json({ success: true, message: 'Request sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send request' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
