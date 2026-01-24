const express = require('express');
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackByMealType,
} = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, submitFeedback);
router.get('/', authMiddleware, getAllFeedback);
router.get('/:mealType', authMiddleware, getFeedbackByMealType);

module.exports = router;
