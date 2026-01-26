import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';
import '../styles/Secretary.css';

export const ManageComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedComplaint, setExpandedComplaint] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
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
      //alert('Reply sent successfully to the student!');
      setReplyMessage('');
      setExpandedComplaint(null);
      fetchComplaints();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert(error.response?.data?.message || 'Error sending reply');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="secretary-container">
      <h1>Manage Complaints</h1>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="statusFilter">Filter by Status: </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="resolved">Solved</option>
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : complaints.length > 0 ? (
        <div className="complaints-list">
          {complaints
            .filter(c => statusFilter === 'all' ? true : c.status === statusFilter)
            .map((complaint) => (
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
  );
};
