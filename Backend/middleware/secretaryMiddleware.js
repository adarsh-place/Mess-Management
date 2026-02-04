const User = require('../models/User');

const secretaryMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('role');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.role !== 'secretary') {
      return res.status(403).json({ message: 'Secretary privileges required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = secretaryMiddleware;
