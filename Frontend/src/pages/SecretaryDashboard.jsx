import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';
import '../styles/Secretary.css';

export const SecretaryDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [polls, setPolls] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Reply states
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  
  // Form states
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollType, setPollType] = useState('single');
  const [pollMessage, setPollMessage] = useState('');
  const [pollLoading, setPollLoading] = useState(false);

  // Helper function to check if date is within past 7 days
  const isWithinPastWeek = (date) => {
    const itemDate = new Date(date);
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return itemDate >= sevenDaysAgo && itemDate <= today;
  };

  // Filter items to show only those from past week
  const getRecentComplaints = () => {
    return complaints.filter(complaint => isWithinPastWeek(complaint.createdAt));
  };

  const getRecentNotices = () => {
    return notices.filter(notice => isWithinPastWeek(notice.createdAt));
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'complaints') {
        const response = await axios.get('http://localhost:5000/api/complaints');
        setComplaints(response.data);
      }
      if (activeTab === 'overview') {
        const response = await axios.get('http://localhost:5000/api/notices');
        setNotices(response.data);
      }
      if (activeTab === 'polls') {
        const response = await axios.get('http://localhost:5000/api/polls');
        setPolls(response.data);
      }
      if (activeTab === 'feedback') {
        const response = await axios.get('http://localhost:5000/api/feedback');
        setFeedbacks(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    setPollLoading(true);
    try {
      await axios.post('http://localhost:5000/api/polls', {
        question: pollQuestion,
        pollType,
        options: pollOptions.filter(opt => opt.trim() !== ''),
      });
      setPollMessage('Poll created successfully!');
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollType('single');
      setTimeout(() => setPollMessage(''), 3000);
      fetchData();
    } catch (error) {
      setPollMessage('Error creating poll');
    } finally {
      setPollLoading(false);
    }
  };

  const calculateAverageRating = (mealType) => {
    const mealFeedbacks = feedbacks.filter(f => f.mealType === mealType);
    if (mealFeedbacks.length === 0) return 0;
    const total = mealFeedbacks.reduce((sum, f) => sum + f.rating, 0);
    return (total / mealFeedbacks.length).toFixed(1);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#28a745';
    if (rating >= 3) return '#ffc107';
    return '#dc3545';
  };

  const handleAddReply = async (complaintId) => {
    if (!replyMessage.trim()) {
      alert('Reply message cannot be empty');
      return;
    }

    setReplyLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/complaints/${complaintId}/reply`, {
        message: replyMessage,
      });
      alert('Reply sent successfully to the student!');
      setReplyMessage('');
      setExpandedComplaint(null);
      fetchData();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert(error.response?.data?.message || 'Error sending reply');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="secretary-dashboard">
      <h1>Mess Secretary Control Panel</h1>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          📋 Complaints
        </button>
        <button
          className={`tab-btn ${activeTab === 'polls' ? 'active' : ''}`}
          onClick={() => setActiveTab('polls')}
        >
          🗳️ Polls
        </button>
        <button
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          ⭐ Feedback
        </button>
        <button
          className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          🍽️ Menu
        </button>
        <button
          className={`tab-btn ${activeTab === 'notices' ? 'active' : ''}`}
          onClick={() => setActiveTab('notices')}
        >
          📢 Notices
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Complaints</h3>
                <div className="stat-number">{complaints.length}</div>
              </div>
              <div className="stat-card">
                <h3>Active Polls</h3>
                <div className="stat-number">{polls.length}</div>
              </div>
              <div className="stat-card">
                <h3>Student Feedback</h3>
                <div className="stat-number">{feedbacks.length}</div>
              </div>
            </div>

            <h3>Recent Complaints (Past 7 Days)</h3>
            {loading ? (
              <p>Loading...</p>
            ) : getRecentComplaints().length > 0 ? (
              <div className="complaints-list">
                {getRecentComplaints().slice(0, 5).map((complaint) => (
                  <div key={complaint._id} className="complaint-item">
                    <h4>From {complaint.studentId?.name}</h4>
                    <p>{complaint.text}</p>
                    <span className={`status ${complaint.status}`}>{complaint.status}</span>
                    <small>{new Date(complaint.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p>No complaints in the past 7 days</p>
            )}

            <h3>Recent Notices (Past 7 Days)</h3>
            {loading ? (
              <p>Loading...</p>
            ) : getRecentNotices().length > 0 ? (
              <div className="notices-list">
                {getRecentNotices().slice(0, 5).map((notice) => (
                  <div key={notice._id} className="notice-item">
                    <h4>{notice.title}</h4>
                    <p>{notice.message}</p>
                    <small>{new Date(notice.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p>No notices in the past 7 days</p>
            )}
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="complaints-section">
            <h2>All Complaints</h2>
            {loading ? (
              <p>Loading...</p>
            ) : complaints.length > 0 ? (
              <div className="complaints-list">
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="complaint-item">
                    <div className="complaint-header">
                      <h4>From {complaint.studentId?.name}</h4>
                      <span className={`status ${complaint.status}`}>{complaint.status}</span>
                    </div>
                    <p>{complaint.text}</p>
                    {complaint.imageUrl && (
                      <img src={complaint.imageUrl} alt="Complaint" className="complaint-image" />
                    )}
                    <small>{new Date(complaint.createdAt).toLocaleDateString()}</small>

                    {/* Existing Replies */}
                    {complaint.replies && complaint.replies.length > 0 && (
                      <div className="replies-section">
                        <h5>Replies:</h5>
                        {complaint.replies.map((reply, idx) => (
                          <div key={idx} className="reply-item">
                            <strong>{reply.secretaryId?.name || 'Secretary'}:</strong>
                            <p>{reply.message}</p>
                            <small>{new Date(reply.repliedAt).toLocaleDateString()}</small>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Reply Form */}
                    <button
                      className="reply-toggle-btn"
                      onClick={() => setExpandedComplaint(expandedComplaint === complaint._id ? null : complaint._id)}
                    >
                      {expandedComplaint === complaint._id ? 'Cancel Reply' : 'Reply to Complaint'}
                    </button>

                    {expandedComplaint === complaint._id && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddReply(complaint._id);
                        }}
                        className="reply-form"
                      >
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Enter your reply to the student..."
                          className="reply-input"
                          rows="4"
                        ></textarea>
                        <button type="submit" disabled={replyLoading} className="send-reply-btn">
                          {replyLoading ? 'Sending...' : 'Send Reply & Notify Student'}
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No complaints</p>
            )}
          </div>
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <div className="polls-management">
            <h2>Create & Manage Polls</h2>
            {pollMessage && <div className="message">{pollMessage}</div>}
            <form onSubmit={handleCreatePoll} className="poll-form">
              <div className="form-group">
                <label>Question:</label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Enter poll question"
                  required
                />
              </div>
              <div className="form-group">
                <label>Poll Type:</label>
                <select
                  value={pollType}
                  onChange={(e) => setPollType(e.target.value)}
                >
                  <option value="single">Single Choice</option>
                  <option value="multiple">Multiple Choice</option>
                </select>
              </div>
              <div className="form-group">
                <label>Options:</label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="option-input">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handlePollOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollOption(index)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addPollOption} className="add-btn">
                  Add Option
                </button>
              </div>
              <button type="submit" disabled={pollLoading}>
                {pollLoading ? 'Creating...' : 'Create Poll'}
              </button>
            </form>

            <h3>Active Polls</h3>
            {polls.length > 0 ? (
              <div className="polls-list">
                {polls.map((poll) => (
                  <div key={poll._id} className="poll-item">
                    <h4>{poll.question}</h4>
                    <span className="poll-type">{poll.pollType === 'single' ? 'Single' : 'Multiple'}</span>
                    <div className="poll-options">
                      {poll.options.map((option, idx) => (
                        <div key={idx} className="poll-option-stats">
                          <span>{option.text}</span>
                          <span className="votes">{option.votes} votes</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No polls created yet</p>
            )}
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="feedback-section">
            <h2>Student Feedback & Ratings</h2>
            <div className="ratings-summary">
              <div className="rating-card">
                <h3>Breakfast</h3>
                <div className="rating-display" style={{ color: getRatingColor(calculateAverageRating('breakfast')) }}>
                  ★ {calculateAverageRating('breakfast')}
                </div>
                <p>{feedbacks.filter(f => f.mealType === 'breakfast').length} ratings</p>
              </div>
              <div className="rating-card">
                <h3>Lunch</h3>
                <div className="rating-display" style={{ color: getRatingColor(calculateAverageRating('lunch')) }}>
                  ★ {calculateAverageRating('lunch')}
                </div>
                <p>{feedbacks.filter(f => f.mealType === 'lunch').length} ratings</p>
              </div>
              <div className="rating-card">
                <h3>Dinner</h3>
                <div className="rating-display" style={{ color: getRatingColor(calculateAverageRating('dinner')) }}>
                  ★ {calculateAverageRating('dinner')}
                </div>
                <p>{feedbacks.filter(f => f.mealType === 'dinner').length} ratings</p>
              </div>
            </div>

            <h3>Recent Feedback</h3>
            {feedbacks.length > 0 ? (
              <div className="feedback-list">
                {feedbacks.slice(0, 10).map((feedback) => (
                  <div key={feedback._id} className="feedback-item">
                    <h4>{feedback.studentId?.name}</h4>
                    <span className="meal-type">{feedback.mealType}</span>
                    <div className="stars">
                      {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                    </div>
                    <p>{feedback.text}</p>
                    <small>{new Date(feedback.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p>No feedback yet</p>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="menu-section">
            <h2>Manage Menu</h2>
            <a href="/manage-menu" className="action-btn">📝 Edit Menu</a>
          </div>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <div className="notices-section">
            <h2>Send Notifications</h2>
            <a href="/send-notice" className="action-btn">📢 Send Notice</a>
          </div>
        )}
      </div>
    </div>
  );
};
