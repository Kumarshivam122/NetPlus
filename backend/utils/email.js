const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER || "netplusenterprisesdhn@gmail.com",
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
  }
});

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
    from: '"Net Plus Contact Form" <admin@netplusenterprises.com>',
    to: adminEmail,
    replyTo: email,
    subject: `New Contact Query: ${subject || 'General Inquiry'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `
  };

  try {
    await transport.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending contact email:", error);
    return false;
  }
};

const sendRequestEmail = async (requestData) => {
  const adminEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'netplusenterprisesdhn@gmail.com';
  const { medicineName, email, phone, notes } = requestData;

  const mailOptions = {
    from: '"Net Plus Request Portal" <admin@netplusenterprises.com>',
    to: adminEmail,
    replyTo: email,
    subject: `New Medicine Request: ${medicineName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <h2>New Medicine Request</h2>
        <p><strong>Medicine Name:</strong> ${medicineName}</p>
        <p><strong>User Email:</strong> ${email}</p>
        <p><strong>User Phone:</strong> ${phone}</p>
        <hr />
        <p><strong>Additional Notes:</strong></p>
        <p style="white-space: pre-wrap;">${notes || 'None'}</p>
      </div>
    `
  };

  try {
    await transport.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending request email:", error);
    return false;
  }
};

module.exports = { sendOTPEmail, sendWelcomeEmail, sendVerificationEmail, sendContactEmail, sendRequestEmail };

