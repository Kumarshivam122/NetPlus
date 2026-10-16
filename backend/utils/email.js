const path = require('path');
const dotenv = require('dotenv');
dotenv.config(); // Load backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') }); // Load root .env

const nodemailer = require('nodemailer');

function getTransport() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || "netplusenterprisesdhn@gmail.com";
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: user.trim(),
      pass: pass ? pass.trim() : undefined
    }
  });
}

const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: '"Net Plus Admin" <admin@netplusenterprises.com>',
    to: to,
    subject: 'Your Password Reset OTP',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2d3748; font-size: 24px; margin: 0;">NET PLUS ENTERPRISES</h2>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border-top: 4px solid #e97f39;">
          <h3 style="color: #1a202c; font-size: 20px; margin-top: 0;">Password Reset Request</h3>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Please use the One-Time Password (OTP) below to proceed. This OTP is valid for 10 minutes.</p>
          
          <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-radius: 6px; margin: 30px 0;">
            <h1 style="color: #00b8a9; font-size: 40px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          
          <p style="color: #718096; font-size: 14px; margin-bottom: 0;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #a0aec0; font-size: 12px;">
          &copy; ${new Date().getFullYear()} NET PLUS ENTERPRISES. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: '"Net Plus Admin" <admin@netplusenterprises.com>',
    to: to,
    subject: 'Welcome to NET PLUS ENTERPRISES!',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2d3748; font-size: 24px; margin: 0;">NET PLUS ENTERPRISES</h2>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border-top: 4px solid #e97f39;">
          <h3 style="color: #1a202c; font-size: 20px; margin-top: 0;">Welcome, ${name}!</h3>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">We are thrilled to have you onboard. Your registration has been received successfully.</p>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Please complete your profile and upload your documents to gain full access to the wholesale portal.</p>
          
          <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-radius: 6px; margin: 30px 0;">
            <p style="color: #00b8a9; font-size: 16px; margin: 0; font-weight: bold;">We look forward to doing business with you!</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #a0aec0; font-size: 12px;">
          &copy; ${new Date().getFullYear()} NET PLUS ENTERPRISES. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log("Welcome Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};

const sendVerificationEmail = async (to, otp) => {
  const mailOptions = {
    from: '"Net Plus Admin" <admin@netplusenterprises.com>',
    to: to,
    subject: 'Verify your NET PLUS Account',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2d3748; font-size: 24px; margin: 0;">NET PLUS ENTERPRISES</h2>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border-top: 4px solid #00b8a9;">
          <h3 style="color: #1a202c; font-size: 20px; margin-top: 0;">Verify your email address</h3>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">Thank you for registering with NET PLUS. To complete your sign up, please use the One-Time Password (OTP) below to verify your email address. This OTP is valid for 10 minutes.</p>
          
          <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-radius: 6px; margin: 30px 0;">
            <h1 style="color: #0d9488; font-size: 40px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          
          <p style="color: #718096; font-size: 14px; margin-bottom: 0;">If you did not request this, please ignore this email.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #a0aec0; font-size: 12px;">
          &copy; ${new Date().getFullYear()} NET PLUS ENTERPRISES. All rights reserved.
        </div>
      </div>
    `
  };

  try {
    const transport = getTransport();
    const info = await transport.sendMail(mailOptions);
    console.log("Verification email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

const sendContactEmail = async (contactData) => {
  const adminEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'netplusenterprisesdhn@gmail.com';
  const { name, email, phone, subject, message } = contactData;

  const mailOptions = {
    from: `"Net Plus Contact" <${adminEmail}>`,
    to: adminEmail,
    replyTo: email,
    subject: `[NetPlus Inquiry] ${subject || 'New Contact Submission'} from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
        <div style="border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 20px;">📩 New Contact Form Inquiry</h2>
          <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Received via NET PLUS website contact page</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; color: #0d9488;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; color: #0f172a;">${phone} (<a href="https://wa.me/91${phone.replace(/\D/g, '').slice(-10)}">WhatsApp</a>)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;"><strong>Subject:</strong></td>
            <td style="padding: 8px 0; color: #0f172a;">${subject || 'General Inquiry'}</td>
          </tr>
        </table>
        <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 12px 16px; border-radius: 4px; margin-top: 12px;">
          <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 6px;">Message:</strong>
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          NET PLUS Central Depot • Wholesale Pharma Network
        </div>
      </div>
    `
  };

  try {
    const transport = getTransport();
    const info = await transport.sendMail(mailOptions);
    console.log("Contact email sent: %s", info?.messageId);
    return true;
  } catch (error) {
    console.error("Error sending contact email:", error);
    return false;
  }
};

const sendRequestEmail = async (requestData) => {
  const adminEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'netplusenterprisesdhn@gmail.com';
  const { medicineName, email, phone, notes, userName, pharmacyName, dlNumber } = requestData;

  const mailOptions = {
    from: `"Net Plus Medicine Request" <${adminEmail}>`,
    to: adminEmail,
    replyTo: email,
    subject: `🚨 [Medicine Request] ${medicineName}${pharmacyName ? ` - ${pharmacyName}` : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
        <div style="border-bottom: 2px solid #e97f39; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 20px;">💊 New Medicine Requirement Request</h2>
          <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Submitted via NET PLUS Retailer Portal</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Requested Medicine:</strong></td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-size: 16px;">${medicineName}</td>
          </tr>
          ${pharmacyName ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;"><strong>Pharmacy Name:</strong></td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${pharmacyName}</td>
          </tr>` : ''}
          ${userName ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;"><strong>Retailer Name:</strong></td>
            <td style="padding: 8px 0; color: #0f172a;">${userName}</td>
          </tr>` : ''}
          ${dlNumber ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;"><strong>Drug License (DL):</strong></td>
            <td style="padding: 8px 0; color: #0f172a;">${dlNumber}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; color: #64748b;"><strong>Retailer Email:</strong></td>
            <td style="padding: 8px 0; color: #0d9488;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;"><strong>Retailer Phone:</strong></td>
            <td style="padding: 8px 0; color: #0f172a;">${phone} (<a href="https://wa.me/91${phone.replace(/\D/g, '').slice(-10)}">WhatsApp</a>)</td>
          </tr>
        </table>
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-top: 12px;">
          <strong style="color: #92400e; font-size: 14px; display: block; margin-bottom: 6px;">Notes / Dosage / Brand Preferences:</strong>
          <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${notes || 'No extra notes provided'}</p>
        </div>
        <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          NET PLUS Central Depot • Wholesale Pharma Network
        </div>
      </div>
    `
  };

  try {
    const transport = getTransport();
    const info = await transport.sendMail(mailOptions);
    console.log("Request email sent: %s", info?.messageId);
    return true;
  } catch (error) {
    console.error("Error sending request email:", error);
    return false;
  }
};

module.exports = { sendOTPEmail, sendWelcomeEmail, sendVerificationEmail, sendContactEmail, sendRequestEmail };

