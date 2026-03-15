const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const { mealType, rating, description } = req.body;

    // Validation
    if (!mealType || !rating) {
      return res.status(400).json({ message: 'Meal type and rating are required' });
    }

    // Check if feedback already exists for this user, meal, and day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Feedback.findOne({
      studentId: req.userId,
      mealType,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already submitted feedback for this meal today.' });
    }

    const feedback = new Feedback({
      studentId: req.userId,
      mealType,
      rating,
      description,
    });

    await feedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    // Any authenticated user can view all feedback
    const feedback = await Feedback.find().populate('studentId', 'name email');
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;
