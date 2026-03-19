const mongoose = require('mongoose');

const weighInSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
  },
  weightKg: {
    type: Number,
    required: true,
    min: 20,
    max: 500,
  },
});

weighInSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WeighIn', weighInSchema);
