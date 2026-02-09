// Mock Email Service for testing without external dependencies
const crypto = require('crypto');

class MockEmailService {
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOTPEmail(email, otp, type = 'login') {
    // Mock sending - just log to console for testing
    console.log(`OTP for ${email}: ${otp}`);
    console.log(`Type: ${type} | Expires in 10 minutes`);
    
    // Always return success for testing
    return true;
  }

  async sendSecurityNotification(email, event, details = {}) {
    console.log(`Security notification for ${email}: ${event}`);
    console.log(`Details:`, details);
    
    return true;
  }
}

module.exports = new MockEmailService();