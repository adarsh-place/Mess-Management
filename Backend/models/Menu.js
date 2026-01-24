const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  breakfast: {
    type: Array,
    default: [],
  },
  lunch: {
    type: Array,
    default: [],
  },
  dinner: {
    type: Array,
    default: [],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Menu', MenuSchema);
