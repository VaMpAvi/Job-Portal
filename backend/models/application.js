const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job',
    required: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assessment', 'hired', 'rejected'],
    default: 'pending'
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Ensure user can only apply once to a job
ApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);