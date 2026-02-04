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
    
    const { days } = req.body;
    if (!days) {
      return res.status(400).json({ message: 'Days are required' });
    }
    
    let menu = await Menu.findOne({});
    if (menu) {
      menu.days = days;
      menu.updatedAt = Date.now();
      await menu.save();
    } 
    else {
      console.log("aa");
      menu = new Menu({ days });
      await menu.save();
    }
    
    // Send notification to all members
    const allUsers = await User.find({ role: 'student' });
    const emails = allUsers.map(u => u.email);

    await sendMenuUpdateNotification(emails, {days});

    res.status(200).json({ message: 'Weekly menu updated and notification sent', menu });
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
