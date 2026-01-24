import { useState } from 'react';
import axios from 'axios';
import '../styles/Secretary.css';

export const ManageMenuPage = () => {
  const [date, setDate] = useState('');
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/menu', {
        date,
        breakfast: breakfast.split(',').map(item => item.trim()),
        lunch: lunch.split(',').map(item => item.trim()),
        dinner: dinner.split(',').map(item => item.trim()),
      });
      setMessage('Menu uploaded successfully!');
      setDate('');
      setBreakfast('');
      setLunch('');
      setDinner('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error uploading menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="secretary-container">
      <h1>Manage Menu</h1>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit} className="secretary-form">
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Breakfast (comma-separated items):</label>
          <input
            type="text"
            value={breakfast}
            onChange={(e) => setBreakfast(e.target.value)}
            placeholder="e.g., Toast, Eggs, Coffee"
            required
          />
        </div>
        <div className="form-group">
          <label>Lunch (comma-separated items):</label>
          <input
            type="text"
            value={lunch}
            onChange={(e) => setLunch(e.target.value)}
            placeholder="e.g., Rice, Dal, Vegetables"
            required
          />
        </div>
        <div className="form-group">
          <label>Dinner (comma-separated items):</label>
          <input
            type="text"
            value={dinner}
            onChange={(e) => setDinner(e.target.value)}
            placeholder="e.g., Roti, Curry, Salad"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Menu'}
        </button>
      </form>
    </div>
  );
};
