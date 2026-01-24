import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';
import '../styles/Secretary.css';

export const SecretaryOverviewPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [polls, setPolls] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  const isWithinPastWeek = (date) => {
    const itemDate = new Date(date);
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return itemDate >= sevenDaysAgo && itemDate <= today;
  };

  const getRecentComplaints = () => {
    return complaints.filter(complaint => isWithinPastWeek(complaint.createdAt));
  };

  const getRecentNotices = () => {
    return notices.filter(notice => isWithinPastWeek(notice.createdAt));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [complaintRes, noticeRes, pollRes, feedbackRes] = await Promise.all([
        axios.get('http://localhost:5000/api/complaints'),
        axios.get('http://localhost:5000/api/notices'),
        axios.get('http://localhost:5000/api/polls'),
        axios.get('http://localhost:5000/api/feedback'),
      ]);
      setComplaints(complaintRes.data);
      setNotices(noticeRes.data);
      setPolls(pollRes.data);
      setFeedbacks(feedbackRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="secretary-dashboard">
      <h1>Dashboard Overview</h1>

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

      <h2>Recent Complaints (Past 7 Days)</h2>
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

      <h2>Recent Notices (Past 7 Days)</h2>
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
  );
};
