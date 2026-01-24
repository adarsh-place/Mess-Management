import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Complaints.css';

export const ComplaintsPage = () => {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('submit'); // 'submit' or 'history'
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [expandedComplaint, setExpandedComplaint] = useState(null);

  useEffect(() => {
    if (tab === 'history') {
      fetchMyComplaints();
    }
  }, [tab]);

  const fetchMyComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/complaints/my-complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setMessage('Error loading your complaints');
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/complaints', {
        text,
        imageUrl,
      });
      setMessage('Complaint submitted successfully!');
      setText('');
      setImageUrl('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error submitting complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (complaintId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/complaints/${complaintId}`, {
        status: newStatus,
      });
      setMessage('Complaint status updated successfully!');
      setComplaints(prev => prev.map(c => c._id === complaintId ? response.data.complaint : c));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating complaint status');
    }
  };

  return (
    <div className="complaints-container">
      <h1>My Complaints</h1>
      {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${tab === 'submit' ? 'active' : ''}`}
          onClick={() => setTab('submit')}
        >
          📝 Submit New Complaint
        </button>
        <button 
          className={`tab-btn ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          📋 Complaint History
        </button>
      </div>

      {tab === 'submit' ? (
        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your complaint in detail"
              required
              rows="5"
            />
          </div>
          <div className="form-group">
            <label>Image URL (optional):</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      ) : (
        <div className="complaints-history">
          {complaintsLoading ? (
            <p>Loading your complaints...</p>
          ) : complaints.length > 0 ? (
            <div className="complaints-list">
              {complaints.map((complaint) => (
                <div key={complaint._id} className="complaint-card">
                  <div className="complaint-header">
                    <div>
                      <h4>{complaint.text.substring(0, 60)}...</h4>
                      <small className="complaint-date">{new Date(complaint.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div className="status-actions">
                      <span className={`status-badge ${complaint.status}`}>
                        {complaint.status === 'pending' ? '⏳ Pending' : '✅ Solved'}
                      </span>
                      {complaint.status === 'pending' && (
                        <button
                          className="mark-solved-btn"
                          onClick={() => handleChangeStatus(complaint._id, 'resolved')}
                          title="Mark as solved"
                        >
                          Mark Solved
                        </button>
                      )}
                    </div>
                  </div>

                  {complaint.imageUrl && (
                    <img src={complaint.imageUrl} alt="Complaint" className="complaint-image" />
                  )}

                  <p className="complaint-text">{complaint.text}</p>

                  {complaint.replies && complaint.replies.length > 0 && (
                    <div className="replies-section">
                      <h5>📧 Replies from Secretary:</h5>
                      {complaint.replies.map((reply, idx) => (
                        <div key={idx} className="reply-item">
                          <div className="reply-header">
                            <strong>{reply.secretaryId?.name || 'Secretary'}</strong>
                            <small>{new Date(reply.repliedAt).toLocaleDateString()}</small>
                          </div>
                          <p>{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="expand-btn"
                    onClick={() => setExpandedComplaint(expandedComplaint === complaint._id ? null : complaint._id)}
                  >
                    {expandedComplaint === complaint._id ? '▼ Hide Details' : '▶ Show Details'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No complaints submitted yet</p>
          )}
        </div>
      )}
    </div>
  );
};
