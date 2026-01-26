import { useState } from 'react';
import axios from 'axios';
import '../styles/Feedback.css';

export const FeedbackPage = () => {
  const [mealType, setMealType] = useState('breakfast');
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/feedback', {
        mealType,
        rating: parseInt(rating),
        description,
      });
      setMessage('Feedback submitted successfully!');
      setRating(5);
      setDescription('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setMessage('You have already submitted feedback for this meal today.');
      } else {
        setMessage('Error submitting feedback');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="feedback-container">
      <h1>Rate Your Meal</h1>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label>
            Today's Meal Type:
            <span style={{ marginLeft: 10, fontWeight: 400, color: '#555', fontSize: '0.95em' }}>
              ({formattedDate})
            </span>
          </label>
          <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
        <div className="form-group">
          <label>Rating:</label>
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${rating >= star ? 'active' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <p>Selected: {rating} out of 5</p>
        </div>
        <div className="form-group">
          <label>Comments (optional):</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share your feedback about the meal"
            rows="4"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};
