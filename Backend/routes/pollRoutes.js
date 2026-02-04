const express = require('express');
const {
  createPoll,
  getAllPolls,
  votePoll,
  deletePoll,
} = require('../controllers/pollController');
const authMiddleware = require('../middleware/authMiddleware');
const secretaryMiddleware = require('../middleware/secretaryMiddleware');

const router = express.Router();

router.post('/', authMiddleware, secretaryMiddleware, createPoll);
router.get('/', getAllPolls);
router.post('/vote', authMiddleware, votePoll);
router.delete('/:pollId', authMiddleware, secretaryMiddleware, deletePoll);

module.exports = router;
