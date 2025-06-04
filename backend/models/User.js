const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true 
  },
  password: {
    type: String,
    required: true
  },
  role: { 
    type: String, 
    enum: ['employer', 'jobseeker'], 
    default: 'jobseeker'
  },
  company: {
    type: String,
    required: function() {
      return this.role === 'employer';
    }
  }
});

// Check if the model exists before compiling it
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);