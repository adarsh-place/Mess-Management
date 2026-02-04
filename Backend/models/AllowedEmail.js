const mongoose = require('mongoose');

const AllowedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('AllowedEmail', AllowedEmailSchema);
