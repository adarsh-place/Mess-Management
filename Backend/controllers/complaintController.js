const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { sendComplaintNotification } = require('../utils/emailService');

// @desc    Submit a new complaint
// @access  Private (Students)
exports.submitComplaint = async (req, res) => {
  try {
    const { text, imageUrl } = req.body;

    const complaint = new Complaint({
      studentId: req.userId,
      text,
      imageUrl,
    });

    await complaint.save();

    // Send notification to mess secretary
    const secretary = await User.findOne({ role: 'secretary' });
    if (secretary) {
      const student = await User.findById(req.userId);
      await sendComplaintNotification(secretary.email, {
        studentName: student.name,
        text,
        imageUrl,
      });
    }

    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all complaints
// @access  Private (Secretary)
exports.getAllComplaints = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'secretary') {
      return res.status(403).json({ message: 'Only secretaries can view complaints' });
    }

    const complaints = await Complaint.find().populate('studentId', 'name email');
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current student's complaints
// @access  Private (Students)
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ studentId: req.userId })
      .populate('replies.secretaryId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update complaint status
// @access  Private (Secretary or Student who filed it)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const user = await User.findById(req.userId);
    
    // Allow students to update only their own complaints, or allow secretaries
    if (user.role === 'student' && complaint.studentId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'You can only update your own complaints' });
    }
    if (user.role === 'student' && status === 'pending') {
      return res.status(403).json({ message: 'Students can only mark complaints as resolved' });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { status, resolvedAt: status === 'resolved' ? Date.now() : null },
      { new: true }
    ).populate('replies.secretaryId', 'name');

    res.status(200).json({ message: 'Complaint updated successfully', complaint: updatedComplaint });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add reply to complaint
// @access  Private (Secretary)
exports.addReply = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'secretary' && user.role !== 'student') {
      return res.status(403).json({ message: 'Only secretaries and students can reply to complaints' });
    }

    const { complaintId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Reply message cannot be empty' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Add reply
    if (user.role === 'secretary') {
      complaint.replies.push({
        secretaryId: req.userId,
        message,
      });
    } else if (user.role === 'student') {
      complaint.replies.push({
        studentId: req.userId,
        message,
      });
    }

    await complaint.save();

    // Send notification to student who raised the complaint (when secretary replies)
    const student = await User.findById(complaint.studentId);
    const secretary = await User.findById(req.userId);
    if (user.role === 'secretary' && student) {
      const { sendReplyNotification } = require('../utils/emailService');
      await sendReplyNotification(student.email, {
        studentName: student.name,
        secretaryName: secretary.name,
        message,
      });
    }

    const populatedComplaint = await Complaint.findById(complaintId).populate('studentId', 'name email').populate('replies.secretaryId', 'name');

    res.status(200).json({ message: 'Reply added successfully', complaint: populatedComplaint });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;
