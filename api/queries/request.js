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
    const { medicineName, email, phone, notes, userName, pharmacyName, dlNumber } = req.body || {};

    if (!medicineName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const enquiry = {
      id: 'REQ-' + Date.now(),
      type: 'medicine_request',
      medicineName: String(medicineName).trim(),
      name: String(userName || pharmacyName || 'Retailer').trim(),
      pharmacyName: pharmacyName ? String(pharmacyName).trim() : null,
      dlNumber: dlNumber ? String(dlNumber).trim() : null,
      email: String(email).trim(),
      phone: String(phone).trim(),
      subject: `Medicine Request: ${medicineName}`,
      message: notes ? String(notes).trim() : '',
      notes: notes ? String(notes).trim() : '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Dispatch email notification to admin
    try {
      const transporter = getTransport();
      const mailOptions = {
        from: `"Net Plus Medicine Request" <${EMAIL_USER}>`,
        to: EMAIL_USER,
        replyTo: enquiry.email,
        subject: `🚨 [Medicine Request] ${enquiry.medicineName}${enquiry.pharmacyName ? ` - ${enquiry.pharmacyName}` : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
            <div style="border-bottom: 2px solid #e97f39; padding-bottom: 12px; margin-bottom: 16px;">
              <h2 style="color: #0f172a; margin: 0; font-size: 20px;">💊 New Medicine Requirement Request</h2>
              <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Submitted via NET PLUS Retailer Portal</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Requested Medicine:</strong></td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-size: 16px;">${enquiry.medicineName}</td>
              </tr>
              ${enquiry.pharmacyName ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Pharmacy Name:</strong></td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${enquiry.pharmacyName}</td>
              </tr>` : ''}
              ${enquiry.name ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Retailer Name:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${enquiry.name}</td>
              </tr>` : ''}
              ${enquiry.dlNumber ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Drug License (DL):</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${enquiry.dlNumber}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Retailer Email:</strong></td>
                <td style="padding: 8px 0; color: #0d9488;"><a href="mailto:${enquiry.email}">${enquiry.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>Retailer Phone:</strong></td>
                <td style="padding: 8px 0; color: #0f172a;">${enquiry.phone}</td>
              </tr>
            </table>
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-top: 12px;">
              <strong style="color: #92400e; font-size: 14px; display: block; margin-bottom: 6px;">Notes / Dosage / Brand Preferences:</strong>
              <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${enquiry.notes || 'No extra notes provided'}</p>
            </div>
            <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              NET PLUS Central Depot • Wholesale Pharma Network
            </div>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error('Vercel serverless request email dispatch note:', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Medicine request submitted successfully! Our procurement team will review and contact you.',
      enquiry
    });
  } catch (err) {
    console.error('Request handler error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};
