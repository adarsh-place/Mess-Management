const express = require('express');
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackByMealType,
} = require('../controllers/feedbackController');

const router = express.Router();

router.post('/', submitFeedback);
router.get('/', getAllFeedback);
router.get('/:mealType', getFeedbackByMealType);

module.exports = router;
