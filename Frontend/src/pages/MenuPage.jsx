import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ViewMenu.css';   
import { backend } from '../../constant.js';

// Helper to render menu cell with red items
              function renderMenuCell(cellValue) {
                if (!cellValue) return null;
                const [normal, red] = cellValue.split('||');
                const normalItems = normal ? normal.split(',').map(item => item.trim()).filter(Boolean) : [];
                const redItems = red ? red.split(',').map(item => item.trim()).filter(Boolean) : [];
                return (
                  <span>
                    {normalItems.map((item, idx) => (
                      <span key={idx}>{item}{idx < normalItems.length - 1 || redItems.length > 0 ? ', ' : ''}</span>
                    ))}
                    {redItems.map((item, idx) => (
                      <span key={normalItems.length + idx} style={{ color: '#f56565', fontWeight: 600 }}>{item}{idx < redItems.length - 1 ? ', ' : ''}</span>
                    ))}
                  </span>
                );
              }
              
export const MenuPage = () => {
      // Menu feedback state
      const [menuFeedbacks, setMenuFeedbacks] = useState([]);
      const [menuFeedbackLoading, setMenuFeedbackLoading] = useState(false);

      useEffect(() => {
        fetchMenuFeedbacks();
      }, []);

      const fetchMenuFeedbacks = async () => {
        setMenuFeedbackLoading(true);
        try {
          const res = await axios.get(`${backend}/api/menu-feedback`);
          setMenuFeedbacks(res.data || []);
        } catch (err) {
          setMenuFeedbacks([]);
        } finally {
          setMenuFeedbackLoading(false);
        }
      };
    // Feedback form state
    const [feedbackDay, setFeedbackDay] = useState('');
    const [feedbackMeal, setFeedbackMeal] = useState('');
    const [feedbackDescription, setFeedbackDescription] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const handleFeedbackSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${backend}/api/menu-feedback`, {
          day: feedbackDay,
          meal: feedbackMeal,
          description: feedbackDescription,
        });
        setFeedbackMessage('Feedback submitted!');
        setFeedbackDay('');
        setFeedbackMeal('');
        setFeedbackDescription('');
        fetchMenuFeedbacks();
        setTimeout(() => setFeedbackMessage(''), 3000);
      } catch (err) {
        setFeedbackMessage('Error submitting feedback');
      }
    };
  const [menu, setMenu] = useState({});
  const [timings, setTimings] = useState(['8:00 AM - 9:00 AM','1:00 PM - 2:00 PM','8:00 PM - 9:00 PM']);
  const days = [
    'Common','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  const defaultDay = { breakfast: '', lunch: '', dinner: '' };
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backend}/api/menu`);
      const data = res.data;
      if (data && data.days) {
        if (data.timings && Array.isArray(data.timings)) {
          setTimings(data.timings);
        }
        const backendDays = days;
        const newMenu = {};
        backendDays.forEach(day => {
          const arr = data.days[day] || ['', '', ''];
          newMenu[day] = {
            breakfast: arr[0] || '',
            lunch: arr[1] || '',
            dinner: arr[2] || '',
          };
        });
        setMenu(newMenu);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-menu-container">
      <h1>Mess Menu</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className='table'>
        <table className="menu-table">
          <thead>
            <tr>
              <th className="menu-table-day">Day</th>
              <th className="menu-table-breakfast">Breakfast<br /><span className="menu-table-timing">{timings[0]}</span></th>
              <th className="menu-table-lunch">Lunch<br /><span className="menu-table-timing">{timings[1]}</span></th>
              <th className="menu-table-dinner">Dinner<br /><span className="menu-table-timing">{timings[2]}</span></th>
            </tr>
          </thead>
              <th className="menu-table-separator"/>
              <th className="menu-table-separator"/>
              <th className="menu-table-separator"/>
              <th className="menu-table-separator"/ >
          <tbody>
            {days.map(day => (
              <tr key={day}>
                <td className="menu-table-cell">{day}</td>
                <td className="menu-table-cell">{renderMenuCell(menu[day]?.breakfast ?? defaultDay.breakfast)}</td>
                <td className="menu-table-cell">{renderMenuCell(menu[day]?.lunch ?? defaultDay.lunch)}</td>
                <td className="menu-table-cell">{renderMenuCell(menu[day]?.dinner ?? defaultDay.dinner)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      {/* User Feedback Form */}
      <div className="feedback-form-section" style={{ marginTop: 32, padding: 16, border: '1px solid #ccc', borderRadius: 8, maxWidth: 600 }}>
        <h3>Submit Feedback on Current Menu</h3>
        <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontWeight: 600, marginRight: 8 }}>Day:</label>
            <select value={feedbackDay} onChange={e => setFeedbackDay(e.target.value)} required style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #667eea', fontSize: 16, background: '#f7fafc', color: '#333', minWidth: 140 }}>
              <option value="">Select Day</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600, marginRight: 8 }}>Meal:</label>
            <select value={feedbackMeal} onChange={e => setFeedbackMeal(e.target.value)} required style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #667eea', fontSize: 16, background: '#f7fafc', color: '#333', minWidth: 140 }}>
              <option value="">Select Meal</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600, marginBottom: 4 }}>Description:</label>
            <textarea value={feedbackDescription} onChange={e => setFeedbackDescription(e.target.value)} required style={{ width: '100%', minHeight: 60, padding: '8px 12px', borderRadius: 6, border: '1px solid #667eea', fontSize: 16, background: '#f7fafc', color: '#333' }} />
          </div>
          <button type="submit" style={{ background: '#667eea', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, padding: '8px 16px', cursor: 'pointer', fontSize: 16 }}>Submit Feedback</button>
        </form>
        {feedbackMessage && <div style={{ marginTop: 8, color: '#38a169' }}>{feedbackMessage}</div>}
      </div>

      {/* Show Menu Feedbacks */}
      <div className="menu-feedback-section" style={{ marginTop: 24, padding: 16, border: '1px solid #eee', borderRadius: 8, maxWidth: 600 }}>
        <h3>Feedback Submitted on Menu</h3>
        {menuFeedbackLoading ? <div>Loading feedback...</div> : (
          menuFeedbacks.length === 0 ? <div>No feedback yet.</div> : (
            <ul style={{ paddingLeft: 0 }}>
              {menuFeedbacks.map((fb, idx) => (
                <li key={idx} style={{ marginBottom: 12, listStyle: 'none', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                  <strong>{fb.day} - {fb.meal}</strong><br />
                  <span>{fb.description}</span>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
};
