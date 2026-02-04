const User = require('../models/User');

const requireSecretary = async (req, res, next) => {
  try {
    if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (user.role !== 'secretary') return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { requireSecretary };
