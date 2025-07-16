const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Analyst', 'Viewer'],
    default: 'Viewer'
  },
  department: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      dealAlerts: {
        type: Boolean,
        default: true
      },
      weeklyReports: {
        type: Boolean,
        default: true
      }
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'deals', 'analytics'],
        default: 'overview'
      },
      refreshInterval: {
        type: Number,
        default: 300000 // 5 minutes in milliseconds
      }
    }
  },
  permissions: {
    deals: {
      create: {
        type: Boolean,
        default: false
      },
      read: {
        type: Boolean,
        default: true
      },
      update: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      }
    },
    analytics: {
      view: {
        type: Boolean,
        default: true
      },
      export: {
        type: Boolean,
        default: false
      }
    },
    users: {
      manage: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for initials
userSchema.virtual('initials').get(function() {
  return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'Admin':
        this.permissions = {
          deals: { create: true, read: true, update: true, delete: true },
          analytics: { view: true, export: true },
          users: { manage: true }
        };
        break;
      case 'Manager':
        this.permissions = {
          deals: { create: true, read: true, update: true, delete: false },
          analytics: { view: true, export: true },
          users: { manage: false }
        };
        break;
      case 'Analyst':
        this.permissions = {
          deals: { create: false, read: true, update: true, delete: false },
          analytics: { view: true, export: true },
          users: { manage: false }
        };
        break;
      case 'Viewer':
        this.permissions = {
          deals: { create: false, read: true, update: false, delete: false },
          analytics: { view: true, export: false },
          users: { manage: false }
        };
        break;
    }
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { 
      expiresIn: process.env.JWT_EXPIRE || '30d' 
    }
  );
};

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(resource, action) {
  return this.permissions[resource] && this.permissions[resource][action];
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 