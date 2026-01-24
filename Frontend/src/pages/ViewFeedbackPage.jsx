import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Feedback.css';

export const ViewFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, breakfast, lunch, dinner

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/feedback');
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = filter === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.mealType === filter);

  const calculateAverageRating = (mealType) => {
    const mealFeedbacks = feedbacks.filter(f => f.mealType === mealType);
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
        <h2>All Feedback ({filteredFeedbacks.length})</h2>
        {loading ? (
          <p>Loading feedback...</p>
        ) : filteredFeedbacks.length > 0 ? (
          <div className="feedback-items">
            {filteredFeedbacks.map((feedback) => (
              <div key={feedback._id} className="feedback-item">
                <div className="feedback-header">
                  <h3>{feedback.studentId?.name || 'Anonymous'}</h3>
                  <span className="meal-type">{feedback.mealType}</span>
                </div>
                <div className="feedback-rating">
                  <span className="stars" style={{ color: getRatingColor(feedback.rating) }}>
                    {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                  </span>
                  <span className="rating-value">{feedback.rating}/5</span>
                </div>
                <p className="feedback-text">{feedback.text}</p>
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
