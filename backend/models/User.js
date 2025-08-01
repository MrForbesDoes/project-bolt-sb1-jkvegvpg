const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  userType: {
    type: String,
    enum: ['startup', 'student'],
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: true
  },
  signupDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 