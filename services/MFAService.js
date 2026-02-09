const prisma = require('../models/prismaClient');
// Use real email service for production
const EmailService = require('./EmailService');

/**
 * Multi-Factor Authentication Service
 */
class MFAService {
  
  /**
   * Generate and send OTP for user
   */
  async sendOTP(userId, email, type = 'MFA_LOGIN') {
    try {
      // Generate OTP
      const otpCode = EmailService.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      await prisma.otpCode.create({
        data: {
          userId,
          code: otpCode,
          type,
          expiresAt
        }
      });

      // Send email
      const emailSent = await EmailService.sendOTPEmail(email, otpCode, type.toLowerCase());
      
      if (!emailSent) {
        throw new Error('Failed to send OTP email');
      }

      console.log(`OTP sent to user ${userId} at ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(userId, code, type = 'MFA_LOGIN') {
    try {
      // Find valid OTP
      const otpRecord = await prisma.otpCode.findFirst({
        where: {
          userId,
          code,
          type,
          used: false,
          expiresAt: {
            gte: new Date()
          }
        }
      });

      if (!otpRecord) {
        return {
          success: false,
          error: 'Invalid or expired OTP code'
        };
      }

      // Mark as used
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true }
      });

      console.log(`OTP verified for user ${userId}`);
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: 'Failed to verify OTP'
      };
    }
  }

  /**
   * Clean up expired OTP codes
   */
  async cleanupExpiredOTPs() {
    try {
      const result = await prisma.otpCode.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { used: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
          ]
        }
      });
      
      console.log(`Cleaned up ${result.count} expired OTP codes`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up OTPs:', error);
      return 0;
    }
  }

  /**
   * Enable MFA for user
   */
  async enableMFA(userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { mfaEnabled: true }
      });
      
      console.log(`MFA enabled for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error enabling MFA:', error);
      return false;
    }
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { mfaEnabled: false }
      });

      // Cleanup user's OTP codes
      await prisma.otpCode.deleteMany({
        where: { userId }
      });
      
      console.log(`MFA disabled for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      return false;
    }
  }

  /**
   * Check if user has MFA enabled
   */
  async isMFAEnabled(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { mfaEnabled: true }
      });
      
      return user?.mfaEnabled || false;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }

  /**
   * Record login attempt
   */
  async recordLoginAttempt(email, success, details = {}) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      await prisma.loginAttempt.create({
        data: {
          userId: user?.id,
          email,
          success,
          failureReason: details.failureReason,
          ipAddress: details.ipAddress,
          userAgent: details.userAgent
        }
      });
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }

  /**
   * Check for suspicious login attempts
   */
  async checkSuspiciousActivity(email, ipAddress) {
    try {
      const recentAttempts = await prisma.loginAttempt.findMany({
        where: {
          email,
          createdAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
      
      // Check for too many failed attempts
      if (failedAttempts.length >= 5) {
        return {
          suspicious: true,
          reason: 'Too many failed login attempts',
          lockoutTime: 15 * 60 * 1000 // 15 minutes
        };
      }

      // Check for attempts from different IPs
      const uniqueIPs = new Set(recentAttempts.map(attempt => attempt.ipAddress));
      if (uniqueIPs.size > 3) {
        return {
          suspicious: true,
          reason: 'Login attempts from multiple IP addresses',
          requireMFA: true
        };
      }

      return { suspicious: false };
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return { suspicious: false };
    }
  }
}

module.exports = new MFAService();