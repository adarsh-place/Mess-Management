import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/Polls.css";

export const PollsPage = () => {
  const { user } = useContext(AuthContext);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [votedPolls, setVotedPolls] = useState(new Set());

  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/polls");
        setPolls(response.data);
        
        // Initialize selected options for each poll
        const initial = {};
        const voted = new Set();
        
        response.data.forEach((poll) => {
          initial[poll._id] = poll.pollType === 'single' ? null : [];
          
          // Check if current user has voted
          if (poll.voters && poll.voters.some(voter => 
            (typeof voter === 'object' && (voter.userId === user?.id || voter.userId === user?._id)) ||
            (typeof voter === 'string' && (voter === user?.id || voter === user?._id))
          )) {
            voted.add(poll._id);
          }
        });
        
        setSelectedOptions(initial);
        setVotedPolls(voted);
      } catch (error) {
        console.error("Error fetching polls:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [user]);

  const handleOptionClick = (pollId, pollType, optionText) => {
    // Don't allow changes if user has already voted
    if (votedPolls.has(pollId)) {
      return;
    }

    setSelectedOptions(prev => {
      if (pollType === 'single') {
        // Single choice: only one option can be selected
        return { ...prev, [pollId]: optionText };
      } else {
        // Multiple choice: toggle option selection
        const current = Array.isArray(prev[pollId]) ? prev[pollId] : [];
        if (current.includes(optionText)) {
          return { ...prev, [pollId]: current.filter(opt => opt !== optionText) };
        } else {
          return { ...prev, [pollId]: [...current, optionText] };
        }
      }
    });
  };

      const handleVote = async (pollId, pollType) => {
    // Check if already voted
    if (votedPolls.has(pollId)) {
      alert('You have already voted on this poll');
      return;
    }

    const options = selectedOptions[pollId];
    
    // Validate selection
    if (options === null || options === '' || (Array.isArray(options) && options.length === 0)) {
      alert('Please select at least one option');
      return;
    }

    try {
      const voteRes = await axios.post("http://localhost:5000/api/polls/vote", {
        pollId,
        selectedOptions: Array.isArray(options) ? options : [options],
      });

      // If backend returned the updated poll, patch local state for immediate UI update;
      // otherwise fall back to re-fetching all polls.
      if (voteRes.data?.poll) {
        setPolls(prev => prev.map(p => p._id === voteRes.data.poll._id ? voteRes.data.poll : p));
      } else {
        const response = await axios.get("http://localhost:5000/api/polls");
        setPolls(response.data);
      }

      // Keep selectedOptions visible so user can see what they voted for (highlighted)
      // Don't clear them; keep them to show the voted selection
      
      // Mark poll as voted
      setVotedPolls(prev => new Set([...prev, pollId]));

      alert(voteRes.data?.message || 'Vote recorded successfully!');
    } catch (error) {
      console.error("Error voting:", error);
      alert(error.response?.data?.message || 'Error recording vote');
    }
  };

  return (
    <div className="polls-container">
      <h1>Polls</h1>
      {loading ? (
        <p>Loading...</p>
      ) : polls.length > 0 ? (
        <div className="polls-list">
          {polls.map((poll) => {
            const selected = selectedOptions[poll._id];
            const hasVoted = votedPolls.has(poll._id);
            
            return (
              <div key={poll._id} className="poll-card">
                <h2>{poll.question}</h2>
                <div className="poll-type-badge">
                  {poll.pollType === 'single' ? '📍 Single Choice' : '✓ Multiple Choice'}
                </div>
                {hasVoted && <div className="voted-badge">✓ You have voted</div>}
                <div className="options">
                  {poll.options && poll.options.map((option, index) => {
                    // Handle both string and object formats
                    const optionText = typeof option === 'string' ? option : (option.text || option);
                    const optionVotes = typeof option === 'object' ? (option.votes || 0) : 0;
                    
                    const isSelected = poll.pollType === 'single' 
                      ? selected === optionText
                      : Array.isArray(selected) && selected.includes(optionText);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(poll._id, poll.pollType, optionText)}
                        className={`option-btn ${isSelected ? 'selected' : ''} ${hasVoted ? 'disabled' : ''}`}
                        disabled={hasVoted}
                      >
                        <input
                          type={poll.pollType === 'single' ? 'radio' : 'checkbox'}
                          checked={isSelected}
                          onChange={() => {}}
                          name={`poll-${poll._id}`}
                          disabled={hasVoted}
                        />
                        <span>{optionText}</span>
                        {isSelected && hasVoted && <span className="your-choice">✓ Your choice</span>}
                        <span className="votes">({optionVotes})</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handleVote(poll._id, poll.pollType)}
                  className="vote-btn"
                  disabled={hasVoted}
                >
                  {hasVoted ? 'Already Voted' : 'Submit Vote'}
                </button>
                <small>Created by {poll.createdBy?.name}</small>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No active polls</p>
      )}
    </div>
  );
};
