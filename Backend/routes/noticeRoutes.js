const express = require('express');
const {
  createNotice,
  getNotices,
} = require('../controllers/noticeController');

const router = express.Router();

router.post('/', createNotice);
router.get('/', getNotices);

module.exports = router;
