const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  // Basic Deal Information
  dealId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  dealName: {
    type: String,
    required: true,
    trim: true
  },
  advertiser: {
    type: String,
    required: true,
    trim: true
  },
  agency: {
    type: String,
    trim: true
  },
  
  // Deal Configuration
  dealType: {
    type: String,
    enum: ['PMP', 'PG', 'Open Auction', 'Direct'],
    required: true
  },
  platform: {
    type: String,
    required: true,
    trim: true
  },
  exchange: {
    type: String,
    required: true,
    trim: true
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Financial Information
  totalBudget: {
    type: Number,
    required: true,
    min: 0
  },
  spentBudget: {
    type: Number,
    default: 0,
    min: 0
  },
  cpm: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Performance Metrics
  impressions: {
    type: Number,
    default: 0,
    min: 0
  },
  clicks: {
    type: Number,
    default: 0,
    min: 0
  },
  conversions: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Delivery Status
  deliveryStatus: {
    type: String,
    enum: ['Active', 'Paused', 'Completed', 'Under-delivering', 'Over-delivering'],
    default: 'Active'
  },
  
  // Pacing Information
  pacingPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 200
  },
  
  // Quality Metrics
  viewabilityRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  brandSafetyScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Targeting Information
  targeting: {
    demographics: {
      ageRange: String,
      gender: String,
      income: String
    },
    geography: {
      countries: [String],
      regions: [String],
      cities: [String]
    },
    interests: [String],
    behaviors: [String],
    devices: [String],
    dayParting: {
      days: [String],
      hours: [String]
    }
  },
  
  // Creative Information
  creativeSpecs: {
    formats: [String],
    sizes: [String],
    duration: Number
  },
  
  // Notes and Comments
  notes: {
    type: String,
    trim: true
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Historical Performance Data
  dailyPerformance: [{
    date: Date,
    impressions: Number,
    clicks: Number,
    spend: Number,
    conversions: Number,
    viewabilityRate: Number
  }],
  
  // Alerts and Notifications
  alerts: [{
    type: {
      type: String,
      enum: ['Under-delivery', 'Over-delivery', 'Budget-exhausted', 'Low-viewability', 'High-frequency']
    },
    message: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields for calculated metrics
dealSchema.virtual('ctr').get(function() {
  return this.impressions > 0 ? (this.clicks / this.impressions) * 100 : 0;
});

dealSchema.virtual('conversionRate').get(function() {
  return this.clicks > 0 ? (this.conversions / this.clicks) * 100 : 0;
});

dealSchema.virtual('budgetUtilization').get(function() {
  return this.totalBudget > 0 ? (this.spentBudget / this.totalBudget) * 100 : 0;
});

dealSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const endDate = new Date(this.endDate);
  const diffTime = endDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

dealSchema.virtual('isActive').get(function() {
  const today = new Date();
  return today >= this.startDate && today <= this.endDate;
});

// Indexes for better query performance
dealSchema.index({ dealId: 1 });
dealSchema.index({ advertiser: 1 });
dealSchema.index({ platform: 1 });
dealSchema.index({ startDate: 1, endDate: 1 });
dealSchema.index({ deliveryStatus: 1 });
dealSchema.index({ createdBy: 1 });

// Pre-save middleware to calculate pacing
dealSchema.pre('save', function(next) {
  if (this.isModified('spentBudget') || this.isModified('totalBudget')) {
    const today = new Date();
    const totalDays = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today - this.startDate) / (1000 * 60 * 60 * 24));
    
    if (totalDays > 0 && daysPassed > 0) {
      const expectedSpend = (this.totalBudget / totalDays) * daysPassed;
      this.pacingPercentage = expectedSpend > 0 ? (this.spentBudget / expectedSpend) * 100 : 0;
    }
  }
  next();
});

module.exports = mongoose.model('Deal', dealSchema); 