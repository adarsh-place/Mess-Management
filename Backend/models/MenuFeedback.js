const mongoose = require('mongoose');

const MenuFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  meal: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner'],
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MenuFeedback', MenuFeedbackSchema);
