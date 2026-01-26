const Notice = require('../models/Notice');
const User = require('../models/User');
const { sendNoticeToMembers } = require('../utils/emailService');

// @desc    Create and send notice
// @access  Private (Secretary)
exports.createNotice = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'secretary') {
      return res.status(403).json({ message: 'Only secretaries can create notices' });
    }

    const { title, message } = req.body;

    const notice = new Notice({
      title,
      message,
      createdBy: req.userId,
    });

    await notice.save();

    // Send notification to all members
    const allUsers = await User.find({ role: 'student' });
    const emails = allUsers.map(u => u.email);
    console.log(emails);
    sendNoticeToMembers(emails, { title, message }); // fire and forget, do not await

    res.status(201).json({ message: 'Notice created and sent', notice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all notices
// @access  Public
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).populate('createdBy', 'name email');
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;
