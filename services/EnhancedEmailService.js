const nodemailer = require('nodemailer');
const crypto = require('crypto');

/**
 * Enhanced Email Service with professional templates and better verification
 */
class EnhancedEmailService {
  constructor() {
    this.transporter = this.createTransporter();
    this.rateLimit = new Map(); // Simple in-memory rate limiting
  }

  /**
   * Create email transporter
   */
  createTransporter() {
    return nodemailer.createTransporter({
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
   * Check rate limit for email sending
   */
  checkRateLimit(email, maxAttempts = 3, windowMinutes = 15) {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    const key = `email:${email}`;
    
    if (!this.rateLimit.has(key)) {
      this.rateLimit.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxAttempts - 1 };
    }
    
    const limit = this.rateLimit.get(key);
    
    // Reset if window expired
    if (now > limit.resetAt) {
      this.rateLimit.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxAttempts - 1 };
    }
    
    // Check if limit exceeded
    if (limit.count >= maxAttempts) {
      const resetInMinutes = Math.ceil((limit.resetAt - now) / (1000 * 60));
      return { 
        allowed: false, 
        remaining: 0, 
        resetInMinutes 
      };
    }
    
    // Increment count
    limit.count++;
    this.rateLimit.set(key, limit);
    
    return { 
      allowed: true, 
      remaining: maxAttempts - limit.count 
    };
  }

  /**
   * Enhanced OTP email template
   */
  createOTPEmailTemplate(otp, type = 'login', appName = 'Your App') {
    const titles = {
      'login': '🔐 Sign In Verification',
      'signup': '🎉 Welcome! Verify Your Email',
      'password_reset': '🔑 Reset Your Password',
      'mfa_login': '🛡️ Two-Factor Authentication'
    };

    const messages = {
      'login': 'Please enter this verification code to complete your sign in:',
      'signup': 'Welcome to our platform! Please verify your email address to get started:',
      'password_reset': 'Use this code to reset your password. If you didn\'t request this, please ignore this email:',
      'mfa_login': 'Enter this code to complete your two-factor authentication:'
    };

    const title = titles[type] || titles.login;
    const message = messages[type] || messages.login;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">${appName}</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">${title}</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #333; margin: 0 0 20px; font-size: 24px; font-weight: 600;">Hello!</h2>
                
                <p style="color: #666; line-height: 1.6; margin: 0 0 30px; font-size: 16px;">
                    ${message}
                </p>
                
                <!-- OTP Code Box -->
                <div style="background: linear-gradient(145deg, #f1f3f4, #e8eaed); border: 2px solid #e0e0e0; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                    <p style="color: #666; margin: 0 0 15px; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
                    <div style="font-size: 36px; font-weight: 700; color: #1a73e8; letter-spacing: 8px; font-family: 'Courier New', monospace; text-shadow: 0 2px 4px rgba(26, 115, 232, 0.2);">
                        ${otp}
                    </div>
                    <p style="color: #666; margin: 15px 0 0; font-size: 14px;">
                        <strong>Valid for 10 minutes</strong>
                    </p>
                </div>
                
                <!-- Security Info -->
                <div style="background: #e8f5e8; border-left: 4px solid #34a853; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h3 style="color: #137333; margin: 0 0 10px; font-size: 16px; font-weight: 600;">🛡️ Security Tips</h3>
                    <ul style="color: #137333; margin: 0; padding-left: 20px; line-height: 1.6;">
                        <li>Never share this code with anyone</li>
                        <li>We will never ask for this code over phone or email</li>
                        <li>This code expires in 10 minutes</li>
                    </ul>
                </div>
                
                <p style="color: #666; line-height: 1.6; margin: 30px 0 0; font-size: 14px;">
                    If you didn't request this verification code, please ignore this email or 
                    <a href="#" style="color: #1a73e8; text-decoration: none;">contact our support team</a> 
                    if you have concerns about your account security.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="color: #666; margin: 0; font-size: 14px;">
                    This is an automated message from <strong>${appName}</strong>
                </p>
                <p style="color: #999; margin: 10px 0 0; font-size: 12px;">
                    Please do not reply to this email. This mailbox is not monitored.
                </p>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Send enhanced OTP email
   */
  async sendEnhancedOTP(email, otp, type = 'login') {
    // Check rate limit
    const rateCheck = this.checkRateLimit(email);
    if (!rateCheck.allowed) {
      throw new Error(`Too many requests. Try again in ${rateCheck.resetInMinutes} minutes.`);
    }

    const subject = this.getEmailSubject(type);
    const html = this.createOTPEmailTemplate(otp, type);

    return this.sendEmail(email, subject, html, otp, type);
  }

  /**
   * Get email subject based on type
   */
  getEmailSubject(type) {
    const subjects = {
      'login': '🔐 Your Login Verification Code',
      'signup': '🎉 Verify Your Email Address', 
      'password_reset': '🔑 Password Reset Code',
      'mfa_login': '🛡️ Two-Factor Authentication Code'
    };
    return subjects[type] || subjects.login;
  }

  /**
   * Send email with fallback
   */
  async sendEmail(email, subject, html, otp, type) {
    const hasValidCredentials = process.env.EMAIL_USER && 
                               process.env.EMAIL_APP_PASSWORD && 
                               process.env.EMAIL_USER.includes('@') &&
                               process.env.EMAIL_APP_PASSWORD !== 'your-gmail-app-password-here';

    if (!hasValidCredentials) {
      this.logEmailFallback(email, subject, otp, type);
      return { success: true, method: 'fallback' };
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || `"${process.env.APP_NAME || 'Your App'}" <noreply@yourapp.com>`,
        to: email,
        subject: subject,
        html: html
      });
      
      console.log(`✅ Enhanced email sent to ${email} | OTP: ${otp} | Type: ${type}`);
      return { success: true, method: 'email' };
    } catch (error) {
      console.error('❌ Failed to send real email:', error.message);
      this.logEmailFallback(email, subject, otp, type);
      return { success: true, method: 'fallback' };
    }
  }

  /**
   * Log email fallback to console
   */
  logEmailFallback(email, subject, otp, type) {
    console.log(`\n📧 EMAIL FALLBACK MODE`);
    console.log(`📩 To: ${email}`);
    console.log(`📝 Subject: ${subject}`);
    console.log(`🔐 OTP CODE: ${otp}`);
    console.log(`⏰ Type: ${type} | Expires in 10 minutes`);
    console.log(`🔄 Configure EMAIL_USER and EMAIL_APP_PASSWORD for real emails\n`);
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(email, userName) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0;">🎉 Welcome to Our Platform!</h1>
        </div>
        <div style="padding: 40px;">
            <h2>Hello ${userName}!</h2>
            <p>Your email has been successfully verified and your account is now active.</p>
            <p>You can now:</p>
            <ul>
                <li>✅ Access your complete profile</li>
                <li>🛒 Browse and purchase products</li>
                <li>❤️ Create wishlists</li>
                <li>📝 Write and read reviews</li>
                <li>🔐 Enable two-factor authentication for extra security</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/profile" 
                   style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                    Go to Your Profile
                </a>
            </div>
        </div>
    </div>`;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Your App" <welcome@yourapp.com>',
        to: email,
        subject: '🎉 Welcome! Your Account is Ready',
        html: html
      });
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }
}

module.exports = new EnhancedEmailService();