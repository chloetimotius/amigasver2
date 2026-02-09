const nodemailer = require('nodemailer');
const crypto = require('crypto');

/**
 * Email Service for sending OTP and notifications
 */
class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Create email transporter
   * Using Gmail SMTP - you'll need to set up app password in Gmail
   */
  createTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
      }
    });
  }

  /**
   * Generate a 6-digit OTP code
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(email, otp, type = 'login') {
    const subject = type === 'login' ? 
      '🔐 Your Login Verification Code' : 
      '🔑 Your Verification Code';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Security Verification Required</h2>
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    // Check if email credentials are properly configured
    const hasValidCredentials = process.env.EMAIL_USER && 
                               process.env.EMAIL_APP_PASSWORD && 
                               process.env.EMAIL_USER.includes('@') &&
                               process.env.EMAIL_APP_PASSWORD !== 'your-gmail-app-password-here';

    if (!hasValidCredentials) {
      // Fallback to console logging for development
      console.log(`\n📧 EMAIL FALLBACK MODE (Configure EMAIL_USER and EMAIL_APP_PASSWORD for real emails)`);
      console.log(`📩 To: ${email}`);
      console.log(`📝 Subject: ${subject}`);
      console.log(`🔐 OTP CODE: ${otp}`);
      console.log(`⏰ Type: ${type} | Expires in 10 minutes\n`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Your App" <noreply@yourapp.com>',
        to: email,
        subject: subject,
        html: html
      });
      
      console.log(`✅ Real email sent to ${email} | OTP: ${otp}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send real email:', error.message);
      
      // Fallback to console if email fails
      console.log(`\n📧 EMAIL FALLBACK (Real email failed)`);
      console.log(`📩 To: ${email}`);
      console.log(`🔐 OTP CODE: ${otp}`);
      console.log(`⏰ Type: ${type} | Expires in 10 minutes\n`);
      return true; // Still return true so the process continues
    }
  }

  /**
   * Send security notification email
   */
  async sendSecurityNotification(email, event, details = {}) {
    const subject = `🔒 Security Alert: ${event}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Security Alert</h2>
        <p>Hello,</p>
        <p>We detected the following security event on your account:</p>
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0;">
          <strong>Event:</strong> ${event}<br>
          <strong>Time:</strong> ${new Date().toLocaleString()}<br>
          ${details.ipAddress ? `<strong>IP Address:</strong> ${details.ipAddress}<br>` : ''}
          ${details.userAgent ? `<strong>Device:</strong> ${details.userAgent}<br>` : ''}
        </div>
        <p>If this was you, you can safely ignore this email. If not, please secure your account immediately.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated security notification.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Your App Security" <security@yourapp.com>',
        to: email,
        subject: subject,
        html: html
      });
      
      console.log(`Security notification sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send security notification:', error);
      return false;
    }
  }
}

module.exports = new EmailService();