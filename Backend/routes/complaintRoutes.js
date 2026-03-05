const express = require("express");
const {
  submitComplaint,
  getAllComplaints,
  getMyComplaints,
  updateComplaintStatus,
  addReply,
} = require("../controllers/complaintController");
const secretaryMiddleware = require("../middleware/secretaryMiddleware");

const router = express.Router();

router.post("/", submitComplaint);
router.get("/", secretaryMiddleware, getAllComplaints);
router.get("/my-complaints", getMyComplaints);
router.put("/:complaintId", updateComplaintStatus);
router.post("/:complaintId/reply", addReply);

module.exports = router;
