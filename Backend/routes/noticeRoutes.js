const express = require('express');
const {
  createNotice,
  getNotices,
} = require('../controllers/noticeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createNotice);
router.get('/',authMiddleware, getNotices);

module.exports = router;
