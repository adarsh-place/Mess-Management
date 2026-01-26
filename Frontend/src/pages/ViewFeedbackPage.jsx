import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Feedback.css';

function getLast7Days() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString()
    });
  }
  return days;
}

export const ViewFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, breakfast, lunch, dinner
  const [selectedDate, setSelectedDate] = useState(getLast7Days()[0].value);
  const last7Days = getLast7Days();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/feedback');
        console.log(response.data);
        const feedbacksRaw = response.data;
        // Fetch student details for each feedback if not already populated
        const feedbacksWithUser = await Promise.all(
          feedbacksRaw.map(async (fb) => {
            if (fb.studentId && typeof fb.studentId === 'string') {
              try {
                const userRes = await axios.get(`http://localhost:5000/api/users/${fb.studentId}`);
                return { ...fb, studentUser: userRes.data };
              } catch {
                return { ...fb, studentUser: null };
              }
            } else if (fb.studentId && typeof fb.studentId === 'object') {
              return { ...fb, studentUser: fb.studentId };
            } else {
              return { ...fb, studentUser: null };
            }
          })
        );
        setFeedbacks(feedbacksWithUser);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);
  
  console.log(feedbacks);
  const filteredFeedbacks = feedbacks.filter(f => {
    const dateMatch = f.createdAt && f.createdAt.slice(0, 10) === selectedDate;
    const mealMatch = filter === 'all' || f.mealType === filter;
    return dateMatch && mealMatch;
  });


  // Calculate average rating for a meal type on the selected date only
  const calculateAverageRating = (mealType) => {
    const mealFeedbacks = feedbacks.filter(f =>
      f.mealType === mealType &&
      f.createdAt && f.createdAt.slice(0, 10) === selectedDate
    );
    if (mealFeedbacks.length === 0) return 0;
    const total = mealFeedbacks.reduce((sum, f) => sum + f.rating, 0);
    return (total / mealFeedbacks.length).toFixed(1);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#28a745'; // green
    if (rating >= 3) return '#ffc107'; // yellow
    return '#dc3545'; // red
  };

  return (
    <div className="feedback-container">
      <h1>Student Feedback & Ratings</h1>

      <div className="ratings-summary-vertical">
        <div className="vertical-rating-card breakfast-vertical">
          <div className="vertical-header">
            <span className="vertical-meal">Breakfast</span>
            <span className="vertical-rating" style={{ color: getRatingColor(calculateAverageRating('breakfast')) }}>
              ★ {calculateAverageRating('breakfast')}
            </span>
          </div>
          <div className="vertical-count">
            {feedbacks.filter(f => f.mealType === 'breakfast' && f.createdAt && f.createdAt.slice(0, 10) === selectedDate).length} ratings
          </div>
        </div>
        <div className="vertical-rating-card lunch-vertical">
          <div className="vertical-header">
            <span className="vertical-meal">Lunch</span>
            <span className="vertical-rating" style={{ color: getRatingColor(calculateAverageRating('lunch')) }}>
              ★ {calculateAverageRating('lunch')}
            </span>
          </div>
          <div className="vertical-count">
            {feedbacks.filter(f => f.mealType === 'lunch' && f.createdAt && f.createdAt.slice(0, 10) === selectedDate).length} ratings
          </div>
        </div>
        <div className="vertical-rating-card dinner-vertical">
          <div className="vertical-header">
            <span className="vertical-meal">Dinner</span>
            <span className="vertical-rating" style={{ color: getRatingColor(calculateAverageRating('dinner')) }}>
              ★ {calculateAverageRating('dinner')}
            </span>
          </div>
          <div className="vertical-count">
            {feedbacks.filter(f => f.mealType === 'dinner' && f.createdAt && f.createdAt.slice(0, 10) === selectedDate).length} ratings
          </div>
        </div>
      </div>

      <div className="filter-section">
        <label htmlFor="dateFilter">Select Date (last 7 days):</label>
        <select
          id="dateFilter"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        >
          {last7Days.map(day => (
            <option key={day.value} value={day.value}>{day.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="mealFilter">Filter by Meal Type:</label>
        <select 
          id="mealFilter"
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Meals</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
      </div>

      <div className="feedback-list">
        <h2>Feedback ({filteredFeedbacks.length})</h2>
        {loading ? (
          <p>Loading feedback...</p>
        ) : filteredFeedbacks.length > 0 ? (
          <div className="feedback-items">
            {filteredFeedbacks.map((feedback) => (
              <div key={feedback._id} className="feedback-item">
                <div className="feedback-header">
                  <h3>
                    {feedback.studentUser
                      ? `${feedback.studentUser.name || 'No Name'}${feedback.studentUser.email ? ' (' + feedback.studentUser.email + ')' : ''}`
                      : 'Anonymous'}
                  </h3>
                  <span className="meal-type">{feedback.mealType}</span>
                </div>
                <div className="feedback-rating">
                  <span className="stars" style={{ color: getRatingColor(feedback.rating) }}>
                    {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                  </span>
                  <span className="rating-value">{feedback.rating}/5</span>
                </div>
                <p className="feedback-text">{feedback.text || feedback.description || 'No comment provided.'}</p>
                <small>{new Date(feedback.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        ) : (
          <p>No feedback available</p>
        )}
      </div>
    </div>
  );
};
