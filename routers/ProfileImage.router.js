const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/profile-images');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename: userId_timestamp_originalname
    const userId = req.session?.user?.id || 'anonymous';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    // Allowed image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

// Configure multer with options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

/**
 * POST /profile-image/upload - Upload and process profile image
 */
router.post('/upload', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const processedFilename = `processed_${filename}`;
    const processedPath = path.join(path.dirname(originalPath), processedFilename);

    try {
      // Process image with Sharp: resize and optimize
      await sharp(originalPath)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(processedPath);

      // Delete original file after processing
      fs.unlinkSync(originalPath);

      // Return success with image URL
      const imageUrl = `/uploads/profile-images/${processedFilename}`;
      
      res.json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          imageUrl: imageUrl,
          filename: processedFilename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });

    } catch (processingError) {
      console.error('Image processing error:', processingError);
      
      // If processing fails, return original file URL
      const imageUrl = `/uploads/profile-images/${filename}`;
      
      res.json({
        success: true,
        message: 'Profile image uploaded (processing skipped)',
        data: {
          imageUrl: imageUrl,
          filename: filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
});

/**
 * DELETE /profile-image/delete - Delete profile image
 */
router.delete('/delete', async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    const filePath = path.join(__dirname, '../../uploads/profile-images', filename);
    
    // Check if file exists and delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Profile image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image file not found'
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
});

/**
 * GET /profile-image/default - Get default avatar
 */
router.get('/default', (req, res) => {
  // Return a default avatar URL or generate one
  res.json({
    success: true,
    data: {
      imageUrl: '/images/default-avatar.png',
      isDefault: true
    }
  });
});

module.exports = router;