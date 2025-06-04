const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  employerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  employerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  salary: {
    type: String
  },
  requirements: {
    type: [String],
    default: []
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for faster queries by employerId
JobSchema.index({ employerId: 1 });

// Compound index for searching
JobSchema.index({
  title: 'text',
  description: 'text',
  company: 'text',
  location: 'text'
});

// Regular indexes for common filter fields
JobSchema.index({ status: 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ company: 1 });
JobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', JobSchema);