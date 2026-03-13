import { useState, useEffect } from 'react';
import axios from 'axios';
import { backend } from '../../constant.js'; // Adjust the import based on your project structure

const API_URL = `${backend}/api/allowed-emails`;

export const ManageAllowedEmailsPage = () => {
  const [email, setEmail] = useState('');
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isFetching, setIsFetching] = useState(true);

  // Fetch allowed emails on mount
  useEffect(() => {
    fetchAllowedEmails();
  }, []);

  const fetchAllowedEmails = async () => {
    try {
      setIsFetching(true);
      const res = await axios.get(API_URL);
      setAllowedEmails(res.data);
    } catch (err) {
      setError('Failed to fetch allowed emails');
    }
    setIsFetching(false);
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

  // Filtered emails by search prefix
  const filteredEmails = search
    ? allowedEmails.filter(item => item.email.toLowerCase().startsWith(search.toLowerCase()))
    : allowedEmails;

  // Bulk delete handler
  const handleDeleteAllPrefix = async () => {
    if (!search) return;
    if (!window.confirm(`Delete all emails starting with '${search}'?`)) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      // Delete all matching emails
      const idsToDelete = filteredEmails.map(item => item._id).filter(Boolean);
      await Promise.all(idsToDelete.map(id => axios.delete(`${API_URL}/${id}`)));
      setMessage('All matching emails deleted!');
      fetchAllowedEmails();
    } catch (err) {
      setError('Failed to delete emails');
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
            <input
              placeholder="Enter email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginBottom: 0 }}
            />
          </div>
          <button type="submit" disabled={loading}
          style={{ marginTop: 0 }}>
            {loading ? 'Adding...' : 'Add Email'}
          </button>
        </form>

        <h3 style={{ marginBottom: 16 }}>Currently Allowed Emails</h3>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search emails by prefix..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="auth-search-input"
            style={{ marginBottom: 8 }}
          />
          <button
            type="button"
            onClick={handleDeleteAllPrefix}
            disabled={loading || !search || filteredEmails.length === 0}
            style={{ width: '100%', marginBottom: 8 }}
          >
            Delete All Matching
          </button>
        </div>
        {isFetching && <div>Fetching...</div>}
        {message && <div style={{ color: 'green', marginBottom: 8 }}>{message}</div>}
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <ul>
          {filteredEmails.map((item) => (
            <li key={item._id || item.email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {item.email}
              <button
                style={{ maxWidth: '100px'}}
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
