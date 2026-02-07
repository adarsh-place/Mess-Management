const express = require('express');
const {
  getMenu,
  updateMenu,
  emailMenu,
} = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const secretaryMiddleware = require('../middleware/secretaryMiddleware');

const router = express.Router();


router.get('/', getMenu);
router.put('/', authMiddleware,secretaryMiddleware, updateMenu);
router.post('/email', authMiddleware, secretaryMiddleware, emailMenu);

module.exports = router;
