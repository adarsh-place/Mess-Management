const express = require('express');
const {
  createMenu,
  getMenu,
  updateMenu,
} = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createMenu);
router.get('/', getMenu);
router.put('/:menuId', authMiddleware, updateMenu);

module.exports = router;
