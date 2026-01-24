const express = require('express');
const {
  submitComplaint,
  getAllComplaints,
  getMyComplaints,
  updateComplaintStatus,
  addReply,
} = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, submitComplaint);
router.get('/', authMiddleware, getAllComplaints);
router.get('/my-complaints', authMiddleware, getMyComplaints);
router.put('/:complaintId', authMiddleware, updateComplaintStatus);
router.post('/:complaintId/reply', authMiddleware, addReply);

module.exports = router;
