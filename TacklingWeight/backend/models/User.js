const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  alias: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30,
  },
  heightCm: {
    type: Number,
    min: 50,
    max: 300,
  },
  startWeightKg: {
    type: Number,
    min: 20,
    max: 500,
  },
  goal: {
    type: String,
    enum: ['lose', 'gain', 'maintain'],
    default: 'maintain',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
