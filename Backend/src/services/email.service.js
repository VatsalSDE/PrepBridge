const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles all email sending operations
 * 
 * Note: Configure SMTP settings in .env:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
 */

// Create transporter (reusable)
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // For development: use console logging if no SMTP credentials are configured.
  if (process.env.NODE_ENV === 'development' && (!smtpHost || !smtpUser || !smtpPass)) {
    return null;
  }

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
};

// Send email (generic)
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  // Development fallback: log to console
  if (!transporter) {
    console.log('\n📧 EMAIL (Dev Mode - No SMTP configured)');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content:', text || html);
    console.log('---\n');
    return { success: true, mode: 'development' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@prepbridge.com',
      to,
      subject,
      html,
      text
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send OTP email
const sendOTP = async (email, otp, name = 'User') => {
  const subject = 'PrepBridge - Verify Your Email';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome to PrepBridge!</h2>
      <p>Hi ${name},</p>
      <p>Your verification code is:</p>
      <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F2937;">${otp}</span>
      </div>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
      <p style="color: #6B7280; font-size: 12px;">PrepBridge - Your Placement Preparation Companion</p>
    </div>
  `;
  const text = `Your PrepBridge verification code is: ${otp}. This code expires in 10 minutes.`;

  return await sendEmail({ to: email, subject, html, text });
};

// Send password reset email
const sendPasswordReset = async (email, resetToken, name = 'User') => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = 'PrepBridge - Reset Your Password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in <strong>1 hour</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
      <p style="color: #6B7280; font-size: 12px;">PrepBridge - Your Placement Preparation Companion</p>
    </div>
  `;
  const text = `Reset your password: ${resetUrl}. This link expires in 1 hour.`;

  return await sendEmail({ to: email, subject, html, text });
};

// Send welcome email after verification
const sendWelcome = async (email, name) => {
  const subject = 'Welcome to PrepBridge! 🎉';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome aboard, ${name}! 🎉</h2>
      <p>Your account is now verified and ready to go.</p>
      <p>Here's what you can do with PrepBridge:</p>
      <ul>
        <li>📝 Plan daily tasks with Pomodoro timer</li>
        <li>📚 Follow structured roadmaps for DSA, Core CS & more</li>
        <li>🏆 Earn badges and maintain streaks</li>
        <li>👥 Connect with fellow aspirants anonymously</li>
        <li>📊 Track your progress with detailed reports</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Go to Dashboard
        </a>
      </div>
      <p>Good luck with your preparation!</p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
      <p style="color: #6B7280; font-size: 12px;">PrepBridge - Your Placement Preparation Companion</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, html });
};

module.exports = {
  sendEmail,
  sendOTP,
  sendPasswordReset,
  sendWelcome
};
