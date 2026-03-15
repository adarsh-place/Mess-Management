const express = require('express');
const MenuFeedback = require('../models/MenuFeedback');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const secretaryMiddleware = require('../middleware/secretaryMiddleware');

// Submit feedback
router.post('/', authMiddleware, async (req, res) => {
  const { day, meal, description } = req.body;
  if (!day || !meal || !description) {
    return res.status(400).json({ error: 'All fields required' });
  }
  try {
    const feedback = new MenuFeedback({ userId: req.userId, day, meal, description });
    await feedback.save();
    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get feedbacks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    let feedbacks;
    if (user.role === 'secretary') {
      feedbacks = await MenuFeedback.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    } else {
      feedbacks = await MenuFeedback.find({ userId: req.userId }).sort({ createdAt: -1 });
    }
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete all feedbacks (secretary only)
router.delete('/all', authMiddleware,secretaryMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'secretary') {
      return res.status(403).json({ error: 'Only secretary can delete all feedbacks' });
    }
    await MenuFeedback.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
