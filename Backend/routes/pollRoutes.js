const express = require('express');
const {
  createPoll,
  getAllPolls,
  votePoll,
  deletePoll,
} = require('../controllers/pollController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createPoll);
router.get('/', getAllPolls);
router.post('/vote', authMiddleware, votePoll);
router.delete('/:pollId', authMiddleware, deletePoll);

module.exports = router;
