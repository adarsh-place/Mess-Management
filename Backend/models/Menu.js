const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  timings:[String],
  days: {
    Common: [String],
    Monday: [String],
    Tuesday: [String],
    Wednesday: [String],
    Thursday: [String],
    Friday: [String],
    Saturday: [String],
    Sunday: [String]
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Menu', MenuSchema);
