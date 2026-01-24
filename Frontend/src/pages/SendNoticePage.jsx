import { useState } from 'react';
import axios from 'axios';
import '../styles/Secretary.css';

export const SendNoticePage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/notices', {
        title,
        message,
      });
      setResponseMsg('Notice sent successfully!');
      setTitle('');
      setMessage('');
      setTimeout(() => setResponseMsg(''), 3000);
    } catch (error) {
      setResponseMsg('Error sending notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="secretary-container">
      <h1>Send Notice</h1>
      {responseMsg && <div className="message">{responseMsg}</div>}
      <form onSubmit={handleSubmit} className="secretary-form">
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notice title"
            required
          />
        </div>
        <div className="form-group">
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Notice message"
            required
            rows="6"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Notice'}
        </button>
      </form>
    </div>
  );
};
