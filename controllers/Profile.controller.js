const User = require('../models/User.model');

/**
 * Profile Controller
 * Handles all profile-related business logic
 */
module.exports = {
  /**
   * Get User Profile
   * GET /profile/
   */
  getProfile: async (req, res) => {
    try {
      const profile = await User.getUserProfile(req.session.userId);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  /**
   * Update User Profile
   * PUT /profile/
   */
  updateProfile: async (req, res) => {
    try {
      const { name, email, phone, address, bio, profileImage } = req.body;
      
      // Input validation
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      // Update profile
      const updatedProfile = await User.updateUserProfile(req.session.userId, {
        name,
        email,
        phone,
        address,
        bio,
        profileImage
      });

      // Update session with new name and email
      req.session.userName = name;
      req.session.userEmail = email;
      
      res.json({
        message: 'Profile updated successfully',
        profile: updatedProfile
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle unique constraint violation (email already exists)
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Email is already registered to another account' });
      }
      
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  /**
   * Get User Analytics
   * GET /profile/analytics
   */
  getAnalytics: async (req, res) => {
    try {
      const analytics = await User.getUserAnalytics(req.session.userId);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  },

  /**
   * Get Recent Orders
   * GET /profile/recent-orders
   */
  getRecentOrders: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const recentOrders = await User.getRecentOrders(req.session.userId, limit);
      res.json({ orders: recentOrders });
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      res.status(500).json({ error: 'Failed to fetch recent orders' });
    }
  },

  /**
   * Update Profile Image
   * PUT /profile/image
   */
  updateProfileImage: async (req, res) => {
    try {
      const { profileImage } = req.body;
      
      if (!profileImage) {
        return res.status(400).json({ error: 'Profile image URL is required' });
      }

      const updatedProfile = await User.updateUserProfile(req.session.userId, {
        profileImage
      });

      res.json({
        message: 'Profile image updated successfully',
        profileImage: updatedProfile.profileImage
      });
    } catch (error) {
      console.error('Error updating profile image:', error);
      res.status(500).json({ error: 'Failed to update profile image' });
    }
  },

  /**
   * Remove Profile Image
   * DELETE /profile/image
   */
  removeProfileImage: async (req, res) => {
    try {
      const updatedProfile = await User.updateUserProfile(req.session.userId, {
        profileImage: null
      });

      res.json({
        message: 'Profile image removed successfully',
        profileImage: null
      });
    } catch (error) {
      console.error('Error removing profile image:', error);
      res.status(500).json({ error: 'Failed to remove profile image' });
    }
  },

  /**
   * Change Password
   * POST /profile/change-password
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Input validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'All password fields are required' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }

      // Validate new password strength
      const { validatePasswordStrength } = require('../utils/passwordValidation');
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: 'New password does not meet security requirements', 
          details: passwordValidation.errors 
        });
      }

      // Change password
      const success = await User.changePassword(req.session.userId, currentPassword, newPassword);
      
      if (!success) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
};