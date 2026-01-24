const Menu = require('../models/Menu');
const User = require('../models/User');
const { sendMenuUpdateNotification } = require('../utils/emailService');

// @desc    Create/Upload menu
// @access  Private (Secretary)
exports.createMenu = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'secretary') {
      return res.status(403).json({ message: 'Only secretaries can create menus' });
    }

    const { date, breakfast, lunch, dinner } = req.body;

    const menu = new Menu({
      date,
      breakfast,
      lunch,
      dinner,
      createdBy: req.userId,
    });

    await menu.save();

    // Send notification to all members
    const allUsers = await User.find({ role: 'student' });
    const emails = allUsers.map(u => u.email);

    await sendMenuUpdateNotification(emails, {
      date,
      breakfast,
      lunch,
      dinner,
    });

    res.status(201).json({ message: 'Menu created and notification sent', menu });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current/upcoming menu
// @access  Public
exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.find().sort({ date: -1 }).limit(10);
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update menu
// @access  Private (Secretary)
exports.updateMenu = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'secretary') {
      return res.status(403).json({ message: 'Only secretaries can update menus' });
    }

    const { menuId } = req.params;
    const { breakfast, lunch, dinner } = req.body;

    const menu = await Menu.findByIdAndUpdate(
      menuId,
      { breakfast, lunch, dinner, updatedAt: Date.now() },
      { new: true }
    );

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // Send notification to all members
    const allUsers = await User.find({ role: 'student' });
    const emails = allUsers.map(u => u.email);

    await sendMenuUpdateNotification(emails, {
      date: menu.date,
      breakfast,
      lunch,
      dinner,
    });

    res.status(200).json({ message: 'Menu updated and notification sent', menu });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;
