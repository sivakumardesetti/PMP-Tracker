const express = require('express');
const { query, validationResult } = require('express-validator');
const Deal = require('../models/Deal');
const { auth, checkPermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get overview analytics
// @access  Private
router.get('/overview', auth, checkPermission('analytics', 'view'), async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Overall metrics
    const totalDeals = await Deal.countDocuments();
    const activeDeals = await Deal.countDocuments({
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    // Financial metrics
    const financialMetrics = await Deal.aggregate([
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$totalBudget' },
          totalSpent: { $sum: '$spentBudget' },
          totalImpressions: { $sum: '$impressions' },
          totalClicks: { $sum: '$clicks' },
          totalConversions: { $sum: '$conversions' },
          avgCPM: { $avg: '$cpm' },
          avgViewabilityRate: { $avg: '$viewabilityRate' },
          avgBrandSafetyScore: { $avg: '$brandSafetyScore' }
        }
      }
    ]);

    // Performance trends (last 30 days)
    const performanceTrends = await Deal.aggregate([
      {
        $match: {
          'dailyPerformance.date': { $gte: thirtyDaysAgo }
        }
      },
      {
        $unwind: '$dailyPerformance'
      },
      {
        $match: {
          'dailyPerformance.date': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$dailyPerformance.date' }
          },
          impressions: { $sum: '$dailyPerformance.impressions' },
          clicks: { $sum: '$dailyPerformance.clicks' },
          spend: { $sum: '$dailyPerformance.spend' },
          conversions: { $sum: '$dailyPerformance.conversions' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top performing deals
    const topDeals = await Deal.find()
      .sort({ impressions: -1 })
      .limit(10)
      .select('dealName advertiser impressions clicks conversions spentBudget ctr conversionRate')
      .populate('createdBy', 'firstName lastName');

    // Delivery status distribution
    const deliveryStatusDistribution = await Deal.aggregate([
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 },
          totalBudget: { $sum: '$totalBudget' },
          totalSpent: { $sum: '$spentBudget' }
        }
      }
    ]);

    // Platform performance
    const platformPerformance = await Deal.aggregate([
      {
        $group: {
          _id: '$platform',
          dealCount: { $sum: 1 },
          totalBudget: { $sum: '$totalBudget' },
          totalSpent: { $sum: '$spentBudget' },
          totalImpressions: { $sum: '$impressions' },
          totalClicks: { $sum: '$clicks' },
          totalConversions: { $sum: '$conversions' },
          avgCPM: { $avg: '$cpm' },
          avgViewabilityRate: { $avg: '$viewabilityRate' }
        }
      },
      {
        $addFields: {
          ctr: {
            $cond: {
              if: { $gt: ['$totalImpressions', 0] },
              then: { $multiply: [{ $divide: ['$totalClicks', '$totalImpressions'] }, 100] },
              else: 0
            }
          },
          conversionRate: {
            $cond: {
              if: { $gt: ['$totalClicks', 0] },
              then: { $multiply: [{ $divide: ['$totalConversions', '$totalClicks'] }, 100] },
              else: 0
            }
          }
        }
      },
      {
        $sort: { totalSpent: -1 }
      }
    ]);

    // Recent alerts
    const recentAlerts = await Deal.aggregate([
      {
        $unwind: '$alerts'
      },
      {
        $match: {
          'alerts.createdAt': { $gte: sevenDaysAgo },
          'alerts.resolved': false
        }
      },
      {
        $sort: { 'alerts.createdAt': -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          dealName: 1,
          advertiser: 1,
          alert: '$alerts'
        }
      }
    ]);

    const metrics = financialMetrics[0] || {
      totalBudget: 0,
      totalSpent: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      avgCPM: 0,
      avgViewabilityRate: 0,
      avgBrandSafetyScore: 0
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalDeals,
          activeDeals,
          ...metrics,
          ctr: metrics.totalImpressions > 0 ? (metrics.totalClicks / metrics.totalImpressions) * 100 : 0,
          conversionRate: metrics.totalClicks > 0 ? (metrics.totalConversions / metrics.totalClicks) * 100 : 0,
          budgetUtilization: metrics.totalBudget > 0 ? (metrics.totalSpent / metrics.totalBudget) * 100 : 0
        },
        performanceTrends,
        topDeals,
        deliveryStatusDistribution,
        platformPerformance,
        recentAlerts
      }
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching analytics overview' 
    });
  }
});

// @route   GET /api/analytics/performance
// @desc    Get performance analytics with date range
// @access  Private
router.get('/performance', auth, checkPermission('analytics', 'view'), [
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('Group by must be day, week, or month')
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

    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const groupBy = req.query.groupBy || 'day';

    let dateFormat;
    switch (groupBy) {
      case 'week':
        dateFormat = '%Y-%U';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const performanceData = await Deal.aggregate([
      {
        $match: {
          'dailyPerformance.date': { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: '$dailyPerformance'
      },
      {
        $match: {
          'dailyPerformance.date': { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$dailyPerformance.date' }
          },
          impressions: { $sum: '$dailyPerformance.impressions' },
          clicks: { $sum: '$dailyPerformance.clicks' },
          spend: { $sum: '$dailyPerformance.spend' },
          conversions: { $sum: '$dailyPerformance.conversions' },
          avgViewabilityRate: { $avg: '$dailyPerformance.viewabilityRate' }
        }
      },
      {
        $addFields: {
          ctr: {
            $cond: {
              if: { $gt: ['$impressions', 0] },
              then: { $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] },
              else: 0
            }
          },
          conversionRate: {
            $cond: {
              if: { $gt: ['$clicks', 0] },
              then: { $multiply: [{ $divide: ['$conversions', '$clicks'] }, 100] },
              else: 0
            }
          },
          cpm: {
            $cond: {
              if: { $gt: ['$impressions', 0] },
              then: { $divide: [{ $multiply: ['$spend', 1000] }, '$impressions'] },
              else: 0
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        performanceData,
        dateRange: { startDate, endDate },
        groupBy
      }
    });
  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching performance analytics' 
    });
  }
});

// @route   GET /api/analytics/advertiser/:advertiser
// @desc    Get analytics for specific advertiser
// @access  Private
router.get('/advertiser/:advertiser', auth, checkPermission('analytics', 'view'), async (req, res) => {
  try {
    const advertiser = req.params.advertiser;

    const advertiserAnalytics = await Deal.aggregate([
      {
        $match: { advertiser: new RegExp(advertiser, 'i') }
      },
      {
        $group: {
          _id: '$advertiser',
          dealCount: { $sum: 1 },
          totalBudget: { $sum: '$totalBudget' },
          totalSpent: { $sum: '$spentBudget' },
          totalImpressions: { $sum: '$impressions' },
          totalClicks: { $sum: '$clicks' },
          totalConversions: { $sum: '$conversions' },
          avgCPM: { $avg: '$cpm' },
          avgViewabilityRate: { $avg: '$viewabilityRate' },
          avgBrandSafetyScore: { $avg: '$brandSafetyScore' }
        }
      },
      {
        $addFields: {
          ctr: {
            $cond: {
              if: { $gt: ['$totalImpressions', 0] },
              then: { $multiply: [{ $divide: ['$totalClicks', '$totalImpressions'] }, 100] },
              else: 0
            }
          },
          conversionRate: {
            $cond: {
              if: { $gt: ['$totalClicks', 0] },
              then: { $multiply: [{ $divide: ['$totalConversions', '$totalClicks'] }, 100] },
              else: 0
            }
          },
          budgetUtilization: {
            $cond: {
              if: { $gt: ['$totalBudget', 0] },
              then: { $multiply: [{ $divide: ['$totalSpent', '$totalBudget'] }, 100] },
              else: 0
            }
          }
        }
      }
    ]);

    // Get deals for this advertiser
    const deals = await Deal.find({ advertiser: new RegExp(advertiser, 'i') })
      .select('dealName dealId totalBudget spentBudget impressions clicks conversions deliveryStatus startDate endDate')
      .sort({ createdAt: -1 });

    // Platform breakdown for this advertiser
    const platformBreakdown = await Deal.aggregate([
      {
        $match: { advertiser: new RegExp(advertiser, 'i') }
      },
      {
        $group: {
          _id: '$platform',
          dealCount: { $sum: 1 },
          totalBudget: { $sum: '$totalBudget' },
          totalSpent: { $sum: '$spentBudget' },
          totalImpressions: { $sum: '$impressions' },
          totalClicks: { $sum: '$clicks' },
          totalConversions: { $sum: '$conversions' }
        }
      },
      {
        $addFields: {
          ctr: {
            $cond: {
              if: { $gt: ['$totalImpressions', 0] },
              then: { $multiply: [{ $divide: ['$totalClicks', '$totalImpressions'] }, 100] },
              else: 0
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        advertiser: advertiserAnalytics[0] || null,
        deals,
        platformBreakdown
      }
    });
  } catch (error) {
    console.error('Advertiser analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching advertiser analytics' 
    });
  }
});

// @route   GET /api/analytics/alerts
// @desc    Get alerts analytics
// @access  Private
router.get('/alerts', auth, checkPermission('analytics', 'view'), async (req, res) => {
  try {
    // Alert summary
    const alertSummary = await Deal.aggregate([
      {
        $unwind: '$alerts'
      },
      {
        $group: {
          _id: '$alerts.type',
          count: { $sum: 1 },
          unresolved: {
            $sum: {
              $cond: [{ $eq: ['$alerts.resolved', false] }, 1, 0]
            }
          },
          critical: {
            $sum: {
              $cond: [{ $eq: ['$alerts.severity', 'Critical'] }, 1, 0]
            }
          },
          high: {
            $sum: {
              $cond: [{ $eq: ['$alerts.severity', 'High'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Recent critical alerts
    const criticalAlerts = await Deal.aggregate([
      {
        $unwind: '$alerts'
      },
      {
        $match: {
          'alerts.severity': 'Critical',
          'alerts.resolved': false
        }
      },
      {
        $sort: { 'alerts.createdAt': -1 }
      },
      {
        $limit: 20
      },
      {
        $project: {
          dealName: 1,
          dealId: 1,
          advertiser: 1,
          alert: '$alerts'
        }
      }
    ]);

    // Alert trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const alertTrends = await Deal.aggregate([
      {
        $unwind: '$alerts'
      },
      {
        $match: {
          'alerts.createdAt': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$alerts.createdAt' }
          },
          count: { $sum: 1 },
          critical: {
            $sum: {
              $cond: [{ $eq: ['$alerts.severity', 'Critical'] }, 1, 0]
            }
          },
          high: {
            $sum: {
              $cond: [{ $eq: ['$alerts.severity', 'High'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        alertSummary,
        criticalAlerts,
        alertTrends
      }
    });
  } catch (error) {
    console.error('Alerts analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching alerts analytics' 
    });
  }
});

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private
router.get('/export', auth, checkPermission('analytics', 'export'), [
  query('type').isIn(['deals', 'performance', 'alerts']).withMessage('Export type must be deals, performance, or alerts'),
  query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
  query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  query('endDate').optional().isISO8601().withMessage('Valid end date is required')
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

    const { type, format = 'json', startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let data;
    let filename;

    switch (type) {
      case 'deals':
        const dealFilter = {};
        if (Object.keys(dateFilter).length > 0) {
          dealFilter.createdAt = dateFilter;
        }

        data = await Deal.find(dealFilter)
          .populate('createdBy', 'firstName lastName email')
          .select('-dailyPerformance -alerts')
          .lean();
        
        filename = `deals_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'performance':
        const performanceFilter = {};
        if (Object.keys(dateFilter).length > 0) {
          performanceFilter['dailyPerformance.date'] = dateFilter;
        }

        data = await Deal.aggregate([
          { $match: performanceFilter },
          { $unwind: '$dailyPerformance' },
          {
            $match: Object.keys(dateFilter).length > 0 ? 
              { 'dailyPerformance.date': dateFilter } : {}
          },
          {
            $project: {
              dealName: 1,
              dealId: 1,
              advertiser: 1,
              platform: 1,
              date: '$dailyPerformance.date',
              impressions: '$dailyPerformance.impressions',
              clicks: '$dailyPerformance.clicks',
              spend: '$dailyPerformance.spend',
              conversions: '$dailyPerformance.conversions',
              viewabilityRate: '$dailyPerformance.viewabilityRate'
            }
          },
          { $sort: { date: -1 } }
        ]);
        
        filename = `performance_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'alerts':
        const alertFilter = {};
        if (Object.keys(dateFilter).length > 0) {
          alertFilter['alerts.createdAt'] = dateFilter;
        }

        data = await Deal.aggregate([
          { $match: alertFilter },
          { $unwind: '$alerts' },
          {
            $match: Object.keys(dateFilter).length > 0 ? 
              { 'alerts.createdAt': dateFilter } : {}
          },
          {
            $project: {
              dealName: 1,
              dealId: 1,
              advertiser: 1,
              alertType: '$alerts.type',
              alertMessage: '$alerts.message',
              alertSeverity: '$alerts.severity',
              alertCreatedAt: '$alerts.createdAt',
              alertResolved: '$alerts.resolved'
            }
          },
          { $sort: { alertCreatedAt: -1 } }
        ]);
        
        filename = `alerts_export_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid export type' 
        });
    }

    if (format === 'csv') {
      // Convert to CSV format
      if (data.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'No data found for export' 
        });
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );

      const csvContent = [headers, ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csvContent);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json({
        success: true,
        data,
        exportInfo: {
          type,
          format,
          exportedAt: new Date(),
          recordCount: data.length
        }
      });
    }
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error exporting analytics data' 
    });
  }
});

module.exports = router; 