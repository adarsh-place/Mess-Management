const express = require('express');
const AllowedEmail = require('../models/AllowedEmail');
const secretaryMiddleware = require('../middleware/secretaryMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/allowed-emails - List all allowed emails
router.get('/', async (req, res) => {
  try {
    const emails = await AllowedEmail.find({});
    res.json(emails);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/allowed-emails - Add a new allowed email
router.post('/',authMiddleware, secretaryMiddleware, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    // Prevent duplicates
    const exists = await AllowedEmail.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already allowed' });
    const allowed = new AllowedEmail({ email });
    await allowed.save();
    res.status(201).json(allowed);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/allowed-emails/:id - Remove an allowed email
router.delete('/:id',authMiddleware, secretaryMiddleware, async (req, res) => {
  try {
    const deleted = await AllowedEmail.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Email not found' });
    res.json({ message: 'Email removed', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
