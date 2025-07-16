const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Deal = require('../models/Deal');
const { auth, checkPermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/deals
// @desc    Get all deals with filtering, sorting, and pagination
// @access  Private
router.get('/', auth, checkPermission('deals', 'read'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'dealName', 'advertiser', 'totalBudget', 'spentBudget', 'startDate', 'endDate', 'deliveryStatus']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
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
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter object
    const filter = {};
    
    if (req.query.advertiser) {
      filter.advertiser = new RegExp(req.query.advertiser, 'i');
    }
    
    if (req.query.platform) {
      filter.platform = new RegExp(req.query.platform, 'i');
    }
    
    if (req.query.exchange) {
      filter.exchange = new RegExp(req.query.exchange, 'i');
    }
    
    if (req.query.dealType) {
      filter.dealType = req.query.dealType;
    }
    
    if (req.query.deliveryStatus) {
      filter.deliveryStatus = req.query.deliveryStatus;
    }
    
    if (req.query.startDate || req.query.endDate) {
      filter.startDate = {};
      if (req.query.startDate) {
        filter.startDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.startDate.$lte = new Date(req.query.endDate);
      }
    }
    
    if (req.query.minBudget || req.query.maxBudget) {
      filter.totalBudget = {};
      if (req.query.minBudget) {
        filter.totalBudget.$gte = parseFloat(req.query.minBudget);
      }
      if (req.query.maxBudget) {
        filter.totalBudget.$lte = parseFloat(req.query.maxBudget);
      }
    }

    // Active deals only filter
    if (req.query.activeOnly === 'true') {
      const today = new Date();
      filter.startDate = { $lte: today };
      filter.endDate = { $gte: today };
    }

    // Get deals with pagination
    const deals = await Deal.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Deal.countDocuments(filter);

    // Calculate summary statistics
    const summary = await Deal.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalDeals: { $sum: 1 },
          totalBudget: { $sum: '$totalBudget' },
          totalSpent: { $sum: '$spentBudget' },
          totalImpressions: { $sum: '$impressions' },
          totalClicks: { $sum: '$clicks' },
          totalConversions: { $sum: '$conversions' },
          avgCPM: { $avg: '$cpm' },
          avgViewabilityRate: { $avg: '$viewabilityRate' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        deals,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        },
        summary: summary[0] || {
          totalDeals: 0,
          totalBudget: 0,
          totalSpent: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          avgCPM: 0,
          avgViewabilityRate: 0
        }
      }
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching deals' 
    });
  }
});

// @route   GET /api/deals/:id
// @desc    Get single deal by ID
// @access  Private
router.get('/:id', auth, checkPermission('deals', 'read'), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!deal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Deal not found' 
      });
    }

    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    console.error('Get deal error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid deal ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching deal' 
    });
  }
});

// @route   POST /api/deals
// @desc    Create a new deal
// @access  Private
router.post('/', auth, checkPermission('deals', 'create'), [
  body('dealId').trim().notEmpty().withMessage('Deal ID is required'),
  body('dealName').trim().notEmpty().withMessage('Deal name is required'),
  body('advertiser').trim().notEmpty().withMessage('Advertiser is required'),
  body('dealType').isIn(['PMP', 'PG', 'Open Auction', 'Direct']).withMessage('Invalid deal type'),
  body('platform').trim().notEmpty().withMessage('Platform is required'),
  body('exchange').trim().notEmpty().withMessage('Exchange is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('totalBudget').isFloat({ min: 0 }).withMessage('Total budget must be a positive number'),
  body('cpm').isFloat({ min: 0 }).withMessage('CPM must be a positive number')
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

    // Check if deal ID already exists
    const existingDeal = await Deal.findOne({ dealId: req.body.dealId });
    if (existingDeal) {
      return res.status(400).json({ 
        success: false, 
        message: 'Deal ID already exists' 
      });
    }

    // Validate date range
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    if (startDate >= endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'End date must be after start date' 
      });
    }

    // Create new deal
    const deal = new Deal({
      ...req.body,
      createdBy: req.user.id
    });

    await deal.save();

    // Populate creator info
    await deal.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: deal
    });
  } catch (error) {
    console.error('Create deal error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Deal ID already exists' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating deal' 
    });
  }
});

// @route   PUT /api/deals/:id
// @desc    Update a deal
// @access  Private
router.put('/:id', auth, checkPermission('deals', 'update'), [
  body('dealName').optional().trim().notEmpty().withMessage('Deal name cannot be empty'),
  body('advertiser').optional().trim().notEmpty().withMessage('Advertiser cannot be empty'),
  body('dealType').optional().isIn(['PMP', 'PG', 'Open Auction', 'Direct']).withMessage('Invalid deal type'),
  body('platform').optional().trim().notEmpty().withMessage('Platform cannot be empty'),
  body('exchange').optional().trim().notEmpty().withMessage('Exchange cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('totalBudget').optional().isFloat({ min: 0 }).withMessage('Total budget must be a positive number'),
  body('spentBudget').optional().isFloat({ min: 0 }).withMessage('Spent budget must be a positive number'),
  body('cpm').optional().isFloat({ min: 0 }).withMessage('CPM must be a positive number'),
  body('impressions').optional().isInt({ min: 0 }).withMessage('Impressions must be a positive integer'),
  body('clicks').optional().isInt({ min: 0 }).withMessage('Clicks must be a positive integer'),
  body('conversions').optional().isInt({ min: 0 }).withMessage('Conversions must be a positive integer'),
  body('deliveryStatus').optional().isIn(['Active', 'Paused', 'Completed', 'Under-delivering', 'Over-delivering']).withMessage('Invalid delivery status'),
  body('viewabilityRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Viewability rate must be between 0 and 100'),
  body('brandSafetyScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Brand safety score must be between 0 and 100')
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

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Deal not found' 
      });
    }

    // Validate date range if both dates are provided
    if (req.body.startDate && req.body.endDate) {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      if (startDate >= endDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'End date must be after start date' 
        });
      }
    }

    // Update deal fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'dealId' && key !== 'createdBy') { // Prevent updating immutable fields
        deal[key] = req.body[key];
      }
    });

    deal.lastModifiedBy = req.user.id;
    await deal.save();

    // Populate user info
    await deal.populate('createdBy', 'firstName lastName email');
    await deal.populate('lastModifiedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Deal updated successfully',
      data: deal
    });
  } catch (error) {
    console.error('Update deal error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid deal ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating deal' 
    });
  }
});

// @route   DELETE /api/deals/:id
// @desc    Delete a deal
// @access  Private
router.delete('/:id', auth, checkPermission('deals', 'delete'), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Deal not found' 
      });
    }

    await Deal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    console.error('Delete deal error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid deal ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting deal' 
    });
  }
});

// @route   POST /api/deals/:id/performance
// @desc    Add daily performance data
// @access  Private
router.post('/:id/performance', auth, checkPermission('deals', 'update'), [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('impressions').isInt({ min: 0 }).withMessage('Impressions must be a positive integer'),
  body('clicks').isInt({ min: 0 }).withMessage('Clicks must be a positive integer'),
  body('spend').isFloat({ min: 0 }).withMessage('Spend must be a positive number'),
  body('conversions').optional().isInt({ min: 0 }).withMessage('Conversions must be a positive integer'),
  body('viewabilityRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Viewability rate must be between 0 and 100')
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

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Deal not found' 
      });
    }

    // Check if performance data for this date already exists
    const existingPerformance = deal.dailyPerformance.find(
      perf => perf.date.toISOString().split('T')[0] === new Date(req.body.date).toISOString().split('T')[0]
    );

    if (existingPerformance) {
      // Update existing performance data
      Object.assign(existingPerformance, req.body);
    } else {
      // Add new performance data
      deal.dailyPerformance.push(req.body);
    }

    // Update overall metrics
    deal.impressions += req.body.impressions;
    deal.clicks += req.body.clicks;
    deal.spentBudget += req.body.spend;
    if (req.body.conversions) {
      deal.conversions += req.body.conversions;
    }

    await deal.save();

    res.json({
      success: true,
      message: 'Performance data added successfully',
      data: deal
    });
  } catch (error) {
    console.error('Add performance error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid deal ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error adding performance data' 
    });
  }
});

// @route   GET /api/deals/:id/alerts
// @desc    Get alerts for a specific deal
// @access  Private
router.get('/:id/alerts', auth, checkPermission('deals', 'read'), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id).select('alerts');
    if (!deal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Deal not found' 
      });
    }

    // Filter alerts based on query parameters
    let alerts = deal.alerts;
    
    if (req.query.resolved !== undefined) {
      const resolved = req.query.resolved === 'true';
      alerts = alerts.filter(alert => alert.resolved === resolved);
    }
    
    if (req.query.severity) {
      alerts = alerts.filter(alert => alert.severity === req.query.severity);
    }

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid deal ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching alerts' 
    });
  }
});

// @route   PUT /api/deals/:id/alerts/:alertId
// @desc    Update alert status
// @access  Private
router.put('/:id/alerts/:alertId', auth, checkPermission('deals', 'update'), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Deal not found' 
      });
    }

    const alert = deal.alerts.id(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alert not found' 
      });
    }

    // Update alert
    if (req.body.resolved !== undefined) {
      alert.resolved = req.body.resolved;
    }

    await deal.save();

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: alert
    });
  } catch (error) {
    console.error('Update alert error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating alert' 
    });
  }
});

module.exports = router; 