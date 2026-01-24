import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

export const StudentDashboard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/notices');
        setNotices(response.data);
      } catch (error) {
        console.error('Error fetching notices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Student Dashboard</h1>
      <div className="dashboard-grid">
        <div className="card">
          <h2>Polls</h2>
          <p>Participate in polls</p>
          <a href="/polls">View Polls</a>
        </div>
        <div className="card">
          <h2>Complaints</h2>
          <p>Raise complaints about the mess</p>
          <a href="/complaints">Raise Complaint</a>
        </div>
        <div className="card">
          <h2>Feedback</h2>
          <p>Rate meals and give feedback</p>
          <a href="/feedback">Give Feedback</a>
        </div>
        <div className="card">
          <h2>Menu</h2>
          <p>View the mess menu</p>
          <a href="/menu">View Menu</a>
        </div>
        <div className="card">
          <h2>View Feedback</h2>
          <p>View all student feedback and ratings</p>
          <a href="/view-feedback">View Feedback</a>
        </div>
      </div>

      <div className="notices-section">
        <h2>Recent Notices</h2>
        {loading ? (
          <p>Loading...</p>
        ) : notices.length > 0 ? (
          <ul>
            {notices.map((notice) => (
              <li key={notice._id}>
                <h3>{notice.title}</h3>
                <p>{notice.message}</p>
                <small>{new Date(notice.createdAt).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notices yet</p>
        )}
      </div>
    </div>
  );
};
