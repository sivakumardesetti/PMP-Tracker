const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { auth, checkPermission, checkRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin only)
router.get('/', auth, checkPermission('users', 'manage'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['Admin', 'Manager', 'Analyst', 'Viewer']).withMessage('Invalid role'),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.department) {
      filter.department = new RegExp(req.query.department, 'i');
    }
    
    if (req.query.search) {
      filter.$or = [
        { firstName: new RegExp(req.query.search, 'i') },
        { lastName: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') }
      ];
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          adminCount: {
            $sum: { $cond: [{ $eq: ['$role', 'Admin'] }, 1, 0] }
          },
          managerCount: {
            $sum: { $cond: [{ $eq: ['$role', 'Manager'] }, 1, 0] }
          },
          analystCount: {
            $sum: { $cond: [{ $eq: ['$role', 'Analyst'] }, 1, 0] }
          },
          viewerCount: {
            $sum: { $cond: [{ $eq: ['$role', 'Viewer'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        },
        stats: userStats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          adminCount: 0,
          managerCount: 0,
          analystCount: 0,
          viewerCount: 0
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching users' 
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private (Admin only)
router.get('/:id', auth, checkPermission('users', 'manage'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching user' 
    });
  }
});

// @route   POST /api/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/', auth, checkPermission('users', 'manage'), [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['Admin', 'Manager', 'Analyst', 'Viewer']).withMessage('Invalid role'),
  body('department').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { firstName, lastName, email, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      department
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating user' 
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update a user
// @access  Private (Admin only)
router.put('/:id', auth, checkPermission('users', 'manage'), [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('role').optional().isIn(['Admin', 'Manager', 'Analyst', 'Viewer']).withMessage('Invalid role'),
  body('department').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id && req.body.isActive === false) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot deactivate your own account' 
      });
    }

    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
    }

    // Update user fields
    const allowedFields = ['firstName', 'lastName', 'email', 'role', 'department', 'isActive'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating user' 
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/:id', auth, checkPermission('users', 'manage'), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting user' 
    });
  }
});

// @route   PUT /api/users/:id/password
// @desc    Reset user password
// @access  Private (Admin only)
router.put('/:id/password', auth, checkPermission('users', 'manage'), [
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update password
    user.password = req.body.newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error resetting password' 
    });
  }
});

// @route   PUT /api/users/:id/activate
// @desc    Activate/deactivate user
// @access  Private (Admin only)
router.put('/:id/activate', auth, checkPermission('users', 'manage'), [
  body('isActive').isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id && req.body.isActive === false) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot deactivate your own account' 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.isActive = req.body.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Activate user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating user status' 
    });
  }
});

// @route   GET /api/users/activity
// @desc    Get user activity analytics
// @access  Private (Admin only)
router.get('/analytics/activity', auth, checkPermission('users', 'manage'), async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Recent logins
    const recentLogins = await User.find({
      lastLogin: { $gte: thirtyDaysAgo }
    })
    .select('firstName lastName email lastLogin role')
    .sort({ lastLogin: -1 })
    .limit(20);

    // User activity summary
    const activitySummary = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          recentLogins: {
            $sum: { 
              $cond: [
                { $gte: ['$lastLogin', thirtyDaysAgo] }, 
                1, 
                0
              ] 
            }
          },
          neverLoggedIn: {
            $sum: { 
              $cond: [
                { $eq: ['$lastLogin', null] }, 
                1, 
                0
              ] 
            }
          }
        }
      }
    ]);

    // Role distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Department distribution
    const departmentDistribution = await User.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      },
      {
        $match: { _id: { $ne: null } }
      }
    ]);

    res.json({
      success: true,
      data: {
        recentLogins,
        activitySummary: activitySummary[0] || {
          totalUsers: 0,
          activeUsers: 0,
          recentLogins: 0,
          neverLoggedIn: 0
        },
        roleDistribution,
        departmentDistribution
      }
    });
  } catch (error) {
    console.error('User activity analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching user activity analytics' 
    });
  }
});

module.exports = router; 