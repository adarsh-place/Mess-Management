import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Secretary.css';
import '../styles/Polls.css';

export const ManagePollsPage = () => {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [pollType, setPollType] = useState('single');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setDataLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/polls');
      setPolls(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setPolls([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!question.trim() || options.some(opt => !opt.trim())) {
        setMessage('Please fill in all fields');
        return;
      }
      await axios.post('http://localhost:5000/api/polls', {
        question,
        pollType,
        options: options.filter(opt => opt.trim() !== ''),
      });
      setMessage('Poll created successfully!');
      setQuestion('');
      setOptions(['', '']);
      setPollType('single');
      fetchPolls(); // Refresh the list
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating poll');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/polls/${pollId}`);
        setMessage('Poll deleted successfully!');
        fetchPolls(); // Refresh the list
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Error deleting poll');
      }
    }
  };

  return (
    <div className="secretary-container">
      <h1>Manage Polls</h1>
      {message && <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
      
      {/* Create Poll Form */}
      <form onSubmit={handleSubmit} className="secretary-form">
        <h3>Create New Poll</h3>
        <div className="form-group">
          <label>Question:</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter poll question"
            required
          />
        </div>
        <div className="form-group">
          <label>Poll Type:</label>
          <select 
            value={pollType} 
            onChange={(e) => setPollType(e.target.value)}
            className="poll-type-select"
          >
            <option value="single">Single Choice</option>
            <option value="multiple">Multiple Choice</option>
          </select>
          <small>
            {pollType === 'single' 
              ? 'Users can select only one option' 
              : 'Users can select multiple options'}
          </small>
        </div>
        <div className="form-group">
          <label>Options:</label>
          {options.map((option, index) => (
            <div key={index} className="option-input">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addOption} className="add-btn">
            Add Option
          </button>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Poll'}
        </button>
      </form>

      {/* Active Polls List */}
      <div className="polls-section" style={{ marginTop: '40px' }}>
        <h2>Active Polls</h2>
        {dataLoading ? (
          <p>Loading polls...</p>
        ) : polls && polls.length > 0 ? (
          <div className="polls-list">
            {polls.map((poll) => (
              <div key={poll._id} className="poll-card">
                <div className="poll-header">
                  <h4>{poll.question}</h4>
                  <div className="poll-header-actions">
                    <span className="poll-type-badge">{poll.pollType || 'single'}</span>
                    <button
                      onClick={() => handleDeletePoll(poll._id)}
                      className="delete-btn"
                      title="Delete poll"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                <div className="poll-results">
                  {poll.options && poll.options.length > 0 && poll.options.map((option, idx) => {
                    // Handle both string options and object options with text property
                    const optionText = typeof option === 'string' ? option : (option.text || option);
                    const optionVotes = typeof option === 'object' ? (option.votes || 0) : 0;
                    
                    // Calculate total votes for percentage
                    const totalVotes = poll.options.reduce((sum, opt) => {
                      const votes = typeof opt === 'object' ? (opt.votes || 0) : 0;
                      return sum + votes;
                    }, 0);
                    
                    const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;

                    return (
                      <div key={idx} className="result-item">
                        <span className="option-name">{optionText}</span>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="vote-count">
                          {optionVotes} votes ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="total-votes">Total Votes: {poll.voters ? poll.voters.length : 0}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No polls created yet</p>
        )}
      </div>
    </div>
  );
};
