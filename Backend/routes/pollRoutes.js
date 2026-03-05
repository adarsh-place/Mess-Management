const express = require('express');
const {
  createPoll,
  getAllPolls,
  votePoll,
  deletePoll,
} = require('../controllers/pollController');
const secretaryMiddleware = require('../middleware/secretaryMiddleware');

const router = express.Router();

router.post('/', secretaryMiddleware, createPoll);
router.get('/', getAllPolls);
router.post('/vote', votePoll);
router.delete('/:pollId', secretaryMiddleware, deletePoll);

module.exports = router;
