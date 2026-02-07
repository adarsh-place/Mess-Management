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
  const [replyMessages, setReplyMessages] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [imageErrors, setImageErrors] = useState({});

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
      setTab('history');
      fetchMyComplaints();
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
              placeholder="Paste direct image URL (see below)"
            />
            <small style={{ color: '#888', display: 'block', marginTop: 4 }}>
              Use a direct image link (ending in .jpg, .png, etc).<br />
              <b>For Google Drive:</b> Share your image, then use:<br />
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                https://drive.google.com/uc?export=view&id=<i>FILE_ID</i>
              </span><br />
              (Replace <i>FILE_ID</i> with the part after <b>/d/</b> and before <b>/view</b> in your share link)
            </small>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      ) : (
        <div className="complaints-history">
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
          {complaintsLoading ? (
            <p>Loading your complaints...</p>
          ) : complaints.length > 0 ? (
            <div className="complaints-list">
              {complaints
                .filter(c => statusFilter === 'all' ? true : c.status === statusFilter)
                .map((complaint) => (
                <div key={complaint._id} className="complaint-card">
                  <div className="complaint-header">
                    <div>
                      <small className="complaint-date">{new Date(complaint.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div className="status-actions">
                      <span className={`status-badge ${complaint.status}`}>
                        {complaint.status === 'pending' ? '⏳' : '✅ Solved'}
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

                  {complaint.imageUrl && !imageErrors[complaint._id] && (
                    <img 
                      src={complaint.imageUrl} 
                      alt="Complaint"
                      className="complaint-image"
                      onError={() => setImageErrors(prev => ({ ...prev, [complaint._id]: true }))}
                    />
                  )}
                  {complaint.imageUrl && imageErrors[complaint._id] && (
                    <div className="image-error-placeholder" style={{ color: 'red', margin: '8px 0' }}>
                      <div style={{
                        width: '100%',
                        height: '180px',
                        background: '#f8d7da',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #f5c2c7',
                        borderRadius: 8
                      }}>
                        <span>Image could not be loaded</span>
                      </div>
                    </div>
                  )}

                  <p className="complaint-text">{complaint.text}</p>

                  {complaint.replies && complaint.replies.length > 0 && (
                    <div className="replies-section">
                      <h5>📧 Replies:</h5>
                      {complaint.replies.map((reply, idx) => (
                        <div key={idx} className="reply-item">
                          <div className="reply-header">
                            <strong>
                              {reply.secretaryId?.name
                                ? reply.secretaryId.name
                                : reply.studentId?.name
                                ? reply.studentId.name
                                : reply.secretaryId
                                ? 'Secretary'
                                : 'Student'}
                            </strong>
                            <small>{new Date(reply.repliedAt).toLocaleDateString()}</small>
                          </div>
                          <p>{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Student Reply Form */}
                  <button
                    className="reply-toggle-btn"
                    onClick={() => setExpandedComplaint(expandedComplaint === complaint._id ? null : complaint._id)}
                  >
                    {expandedComplaint === complaint._id ? 'Cancel Reply' : 'Reply to Complaint'}
                  </button>

                  {expandedComplaint === complaint._id && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const replyMessage = replyMessages[complaint._id] || '';
                        if (!replyMessage.trim()) {
                          alert('Reply message cannot be empty');
                          return;
                        }
                        setReplyLoading((prev) => ({ ...prev, [complaint._id]: true }));
                        try {
                          await axios.post(`http://localhost:5000/api/complaints/${complaint._id}/reply`, {
                            message: replyMessage,
                          });
                          setComplaints((prev) => prev.map((c) =>
                            c._id === complaint._id
                              ? {
                                  ...c,
                                  replies: [
                                    ...c.replies,
                                    {
                                      message: replyMessage,
                                      repliedAt: new Date(),
                                      studentId: { name: 'You' },
                                    },
                                  ],
                                }
                              : c
                          ));
                          setReplyMessages((prev) => ({ ...prev, [complaint._id]: '' }));
                          setExpandedComplaint(null);
                        } catch (error) {
                          alert(error.response?.data?.message || 'Error sending reply');
                        } finally {
                          setReplyLoading((prev) => ({ ...prev, [complaint._id]: false }));
                        }
                      }}
                      className="reply-form"
                    >
                      <textarea
                        value={replyMessages[complaint._id] || ''}
                        onChange={e => setReplyMessages(prev => ({ ...prev, [complaint._id]: e.target.value }))}
                        placeholder="Enter your reply..."
                        className="reply-input"
                        rows="4"
                      ></textarea>
                      <button type="submit" className="send-reply-btn" disabled={replyLoading[complaint._id]}>
                        {replyLoading[complaint._id] ? 'Submitting...' : 'Send Reply'}
                      </button>
                    </form>
                  )}
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
