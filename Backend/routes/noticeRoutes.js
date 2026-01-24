const express = require('express');
const {
  createNotice,
  getNotices,
} = require('../controllers/noticeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createNotice);
router.get('/', getNotices);

module.exports = router;
