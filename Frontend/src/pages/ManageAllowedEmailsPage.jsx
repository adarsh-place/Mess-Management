import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/allowed-emails';

export const ManageAllowedEmailsPage = () => {
  const [email, setEmail] = useState('');
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch allowed emails on mount
  useEffect(() => {
    fetchAllowedEmails();
  }, []);

  const fetchAllowedEmails = async () => {
    try {
      const res = await axios.get(API_URL);
      setAllowedEmails(res.data);
    } catch (err) {
      setError('Failed to fetch allowed emails');
    }
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await axios.post(API_URL, { email });
      setMessage('Email added successfully!');
      setEmail('');
      fetchAllowedEmails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add email');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmail = async (id) => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMessage('Email removed successfully!');
      fetchAllowedEmails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Manage Allowed Emails</h2>
        <form onSubmit={handleAddEmail} style={{ marginBottom: 24 }}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Email'}
          </button>
        </form>
        {message && <div style={{ color: 'green', marginBottom: 8 }}>{message}</div>}
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <h3>Currently Allowed Emails</h3>
        <ul>
          {allowedEmails.map((item) => (
            <li key={item._id || item.email} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {item.email}
              <button
                style={{ marginLeft: 8, color: 'white', background: 'red', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '2px 8px' }}
                onClick={() => handleRemoveEmail(item._id)}
                disabled={loading}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ManageAllowedEmailsPage;
