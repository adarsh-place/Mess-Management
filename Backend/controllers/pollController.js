const Poll = require('../models/Poll');
const User = require('../models/User');

// @desc    Create a new poll (Mess Secretary only)
// @access  Private
exports.createPoll = async (req, res) => {
  try {
    const { question, options, pollType = 'single', expiresAt } = req.body;

    // Verify user is secretary
    const user = await User.findById(req.userId);
    if (user.role !== 'secretary') {
      return res.status(403).json({ message: 'Only secretaries can create polls' });
    }

    // Create poll
    const poll = new Poll({
      question,
      pollType,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      createdBy: req.userId,
      expiresAt,
    });

    await poll.save();

    res.status(201).json({ message: 'Poll created successfully', poll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all polls
// @access  Public
exports.getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().populate('createdBy', 'name email');
    
    // Keep option objects (text + votes) in the response so frontend can show counts
    const transformedPolls = polls.map(poll => {
      const p = poll.toObject();
      p.options = p.options.map(opt => ({ text: opt.text, votes: opt.votes || 0 }));
      return p;
    });

    res.status(200).json(transformedPolls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Vote on a poll
// @access  Private
exports.votePoll = async (req, res) => {
  try {
    const { pollId, selectedOptions } = req.body;
    const userId = req.userId;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user has already voted
    const hasVoted = poll.voters.some(voter => voter.userId.toString() === userId.toString());
    if (hasVoted) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    // Ensure selectedOptions is an array
    const optionsToVote = Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions];

    // Convert option text to indices
    const optionIndices = [];
    for (const optionText of optionsToVote) {
      const index = poll.options.findIndex(opt => opt.text === optionText);
      if (index === -1) {
        return res.status(400).json({ message: `Invalid option: ${optionText}` });
      }
      optionIndices.push(index);
    }

    // Increment vote count for each selected option
    for (const optionIndex of optionIndices) {
      poll.options[optionIndex].votes += 1;
    }
    
    // Add user and their selected options (store indices to match schema)
    poll.voters.push({
      userId,
      selectedOptions: optionIndices,
      votedAt: new Date(),
    });

    await poll.save();

    // Return option objects (text + votes) so frontend can render counts immediately
    const pollObj = poll.toObject();
    pollObj.options = pollObj.options.map(opt => ({ text: opt.text, votes: opt.votes || 0 }));

    res.status(200).json({ message: 'Vote recorded successfully', poll: pollObj });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a poll (Mess Secretary only)
// @access  Private
exports.deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;

    // Verify user is secretary
    const user = await User.findById(req.userId);
    if (user.role !== 'secretary') {
      return res.status(403).json({ message: 'Only secretaries can delete polls' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if secretary created this poll
    if (poll.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'You can only delete polls you created' });
    }

    await Poll.findByIdAndDelete(pollId);

    res.status(200).json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;
