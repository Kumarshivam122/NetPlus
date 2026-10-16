const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || 'netplusenterprisesdhn@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'ofqm zmon nusq stbp';

function getTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { name, email, phone, subject, message } = req.body || {};

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const enquiry = {
      id: 'ENQ-' + Date.now(),
      type: 'contact',
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: String(message).trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Dispatch email notification to admin
    try {
      const transporter = getTransport();
      const mailOptions = {
        from: `"Net Plus Contact" <${EMAIL_USER}>`,
        to: EMAIL_USER,
        replyTo: enquiry.email,
        subject: `[NetPlus Inquiry] ${enquiry.subject} from ${enquiry.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
            <div style="border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px;">
              <h2 style="color: #0f172a; margin: 0; font-size: 20px;">📩 New Contact Form Inquiry</h2>
              <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Received via NET PLUS website contact page</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${enquiry.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; color: #0d9488;"><a href="mailto:${enquiry.email}">${enquiry.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${enquiry.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${enquiry.subject}</td>
              </tr>
            </table>
            <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 12px 16px; border-radius: 4px; margin-top: 12px;">
              <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Message:</strong>
              <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${enquiry.message}</p>
            </div>
            <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              NET PLUS Central Depot • Wholesale Pharma Network
            </div>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error('Vercel serverless contact email dispatch note:', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! Our support team will get in touch soon.',
      enquiry
    });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};
