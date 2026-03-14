import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Secretary.css';
import { backend } from '../../constant.js'; // Update import to use constant.js

export function renderMenuCell(cellValue) {
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

export const ManageMenuPage = () => {
    // Feedback state
    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackMealFilter, setFeedbackMealFilter] = useState('all');
    const [feedbackDayFilter, setFeedbackDayFilter] = useState('all');

    useEffect(() => {
      fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
      setFeedbackLoading(true);
      try {
        // Add Authorization header if needed
        const token = localStorage.getItem('token');
        const res = await axios.get(`${backend}/api/menu-feedback`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setFeedbacks(res.data || []);
      } catch (err) {
        setFeedbacks([]);
      } finally {
        setFeedbackLoading(false);
      }
    };
        
      
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const days = [
    'Common','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  const [timings, setTimings] = useState(['8:00 AM - 9:00 AM','1:00 PM - 2:00 PM','8:00 PM - 9:00 PM']);
  
  const [editDay, setEditDay] = useState('');
  const [editMeal, setEditMeal] = useState('breakfast');
  // editItems: [{ value: string, red: boolean }]
  const [editItems, setEditItems] = useState([]);
  const defaultDay = { breakfast: '', lunch: '', dinner: '' };

  useEffect(() => {
    fetchMenu();
  }, []);

    // Notify everyone after menu update
  const handleNotifyEveryone = async () => {
    setLoading(true);
    try {
      setMessage('Sending notification to everyone!');
      setLoading(false);
      await axios.post(`${backend}/api/menu/email`);
      setTimeout(() => setMessage(''), 3000);
      setMessage('Notifications sent successfully');
    } catch (err) {
      setMessage('Error sending notification');
    } finally {
    }
  };

    // Save timings independently
  const handleSaveTimings = async () => {
    setLoading(true);
    try {
      // Send only timings to backend (keep menu unchanged)
      await axios.put(`${backend}/api/menu/timings`, {timings
      });
      setMessage('Timings updated!');
      setTimeout(() => setMessage(''), 3000);
      fetchMenu();
    } catch (err) {
      setMessage('Error updating timings');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backend}/api/menu`);
      const data = res.data;
      if (data && data.days) {
        if (data.timings && Array.isArray(data.timings)) {
          setTimings(data.timings);
        }
        const backendDays = ['Common','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
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
      setMessage('Error fetching menu');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDayChange = (e) => {
    setEditDay(e.target.value);
    if (e.target.value) {
      setEditMeal('breakfast');
      const value = menu[e.target.value]?.breakfast ?? '';
      // Split by '||' for red items
      const [normal, red] = value.split('||');
      const normalItems = normal ? normal.split(',').map(item => ({ value: item.trim(), red: false })).filter(item => item.value) : [];
      const redItems = red ? red.split(',').map(item => ({ value: item.trim(), red: true })).filter(item => item.value) : [];
      setEditItems([...normalItems, ...redItems]);
    }
  };
  const handleMealChange = (e) => {
    setEditMeal(e.target.value);
    const value = menu[editDay]?.[e.target.value] ?? '';
    const [normal, red] = value.split('||');
    const normalItems = normal ? normal.split(',').map(item => ({ value: item.trim(), red: false })).filter(item => item.value) : [];
    const redItems = red ? red.split(',').map(item => ({ value: item.trim(), red: true })).filter(item => item.value) : [];
    setEditItems([...normalItems, ...redItems]);
  };
  // Add new menu item
  const handleAddItem = () => {
    setEditItems(prev => [...prev, { value: '', red: false }]);
  };
  // Update menu item value
  const handleItemChange = (idx, value) => {
    setEditItems(prev => prev.map((item, i) => i === idx ? { ...item, value } : item));
  };
  // Remove menu item
  const handleRemoveItem = (idx) => {
    setEditItems(prev => prev.filter((_, i) => i !== idx));
  };
  // Toggle red status
  const handleToggleRed = (idx) => {
    setEditItems(prev => prev.map((item, i) => i === idx ? { ...item, red: !item.red } : item));
  };
  const handleEditSave = async () => {
    setLoading(true);
    try {
      // Combine items into comma-separated string, red after ||
      const normalItems = editItems.filter(item => item.value && !item.red).map(item => item.value);
      const redItems = editItems.filter(item => item.value && item.red).map(item => item.value);
      let combinedValue = normalItems.join(', ');
      if (redItems.length > 0) {
        combinedValue += '||' + redItems.join(', ');
      }
      setMenu(prev => ({
        ...prev,
        [editDay]: {
          ...prev[editDay],
          [editMeal]: combinedValue,
        },
      }));
      // Prepare days object in array format
      const backendDays = ['Common','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      const daysObj = {};
      backendDays.forEach(day => {
        daysObj[day] = [
          (day === editDay && editMeal === 'breakfast') ? combinedValue : menu[day]?.breakfast || '',
          (day === editDay && editMeal === 'lunch') ? combinedValue : menu[day]?.lunch || '',
          (day === editDay && editMeal === 'dinner') ? combinedValue : menu[day]?.dinner || ''
        ];
      });
      await axios.put(`${backend}/api/menu`, {
        days: daysObj,
        timings
      });
      setMessage('Meal updated and saved!');
      setTimeout(() => setMessage(''), 3000);
      fetchMenu();
    } catch (err) {
      setMessage('Error updating meal');
    } finally {
      setLoading(false);
      setEditDay('');
    }
  };

  // Finalize: unmark all red items for all days and meals, update menu and backend
  const handleFinalize = async () => {
    setLoading(true);
    try {
      // Unmark all red menu items as before
      const backendDays = ['Common','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      const meals = ['breakfast', 'lunch', 'dinner'];
      const daysObj = {};
      const newMenu = {};
      backendDays.forEach(day => {
        newMenu[day] = {};
        daysObj[day] = [];
        meals.forEach(meal => {
          const value = menu[day]?.[meal] ?? '';
          const [normal, red] = value.split('||');
          const normalItems = normal ? normal.split(',').map(item => item.trim()).filter(Boolean) : [];
          const redItems = red ? red.split(',').map(item => item.trim()).filter(Boolean) : [];
          // Merge all items, remove red marking
          const allItems = [...normalItems, ...redItems];
          const combinedValue = allItems.join(', ');
          newMenu[day][meal] = combinedValue;
          daysObj[day].push(combinedValue);
        });
      });
      setMenu(newMenu);
      await axios.put(`${backend}/api/menu`, {
        days: daysObj,
        timings
      });
      // Delete all menu feedbacks
      const token = localStorage.getItem('token');
      await axios.delete(`${backend}/api/menu-feedback/all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMessage('All red items finalized and all menu feedbacks deleted!');
      setTimeout(() => setMessage(''), 3000);
      fetchMenu();
      fetchFeedbacks();
    } catch (err) {
      setMessage('Error finalizing menu or deleting feedbacks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="secretary-container">
      <h1>Manage Menu</h1>
      {message && <div className="message">{message}</div>}
      {loading && <div>Loading...</div>}
      <div className="mess-timings-box">
        <table className="menu-table" style={{ marginBottom: 0, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ width: '120px' }}>Day</th>
            <th style={{ width: '220px' }}>Breakfast</th>
            <th style={{ width: '220px' }}>Lunch</th>
            <th style={{ width: '220px' }}>Dinner</th>
          </tr>
          <tr>
            <td></td>
            <td>
              <input type="text" value={timings[0]} onChange={e => setTimings([e.target.value, timings[1], timings[2]])} className="menu-items-input" />
            </td>
            <td>
              <input type="text" value={timings[1]} onChange={e => setTimings([timings[0], e.target.value, timings[2]])} className="menu-items-input" />
            </td>
            <td>
              <input type="text" value={timings[2]} onChange={e => setTimings([timings[0], timings[1], e.target.value])} className="menu-items-input" />
            </td>
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day}>
              <td style={{ wordBreak: 'break-word', padding: '8px' }}>{day}</td>
              <td style={{ wordBreak: 'break-word', padding: '8px' }}>{renderMenuCell(menu[day]?.breakfast ?? defaultDay.breakfast)}</td>
              <td style={{ wordBreak: 'break-word', padding: '8px' }}>{renderMenuCell(menu[day]?.lunch ?? defaultDay.lunch)}</td>
              <td style={{ wordBreak: 'break-word', padding: '8px' }}>{renderMenuCell(menu[day]?.dinner ?? defaultDay.dinner)}</td>
            </tr>
          ))}
        </tbody>
        </table>

      </div>
      <div className="edit-menu-form" style={{ marginBottom: 32, padding: 16, border: '1px solid #ccc', borderRadius: 8, maxWidth: 600 }}>
        <h3 style={{ textAlign:'center' }}>Change Menu</h3>
        <div style={{ marginBottom: 8 }}>
          <label>Day:&nbsp;</label>
          <select value={editDay} onChange={handleEditDayChange} className="styled-select">
            <option value="">Select Day</option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        {editDay && (
          <>
            <div style={{ marginBottom: 8 }}>
              <label>Meal:&nbsp;</label>
              <select value={editMeal} onChange={handleMealChange} className="styled-select">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Menu Items:</label>
              <div>
                {editItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <input
                      type="text"
                      value={item.value}
                      onChange={e => handleItemChange(idx, e.target.value)}
                      className="menu-items-input"
                      style={{ flex: 1 }}
                    />
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="menu-cross-btn" style={{ marginLeft: 8 }}>❌</button>
                    <button type="button" onClick={() => handleToggleRed(idx)} className="menu-red-btn" style={{ marginLeft: 8, background: item.red ? '#f56565' : '#fff', color: item.red ? '#fff' : '#f56565', border: '1px solid #f56565', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontWeight: 600 }}>
                      {item.red ? 'Unmark Red' : 'Mark Red'}
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddItem}
                  style={{ marginTop: 8, padding: '6px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(102,126,234,0.15)' }}
                >
                  ➕ Add Item
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setEditDay('')} className="menu-action-btn cancel">Cancel</button>
              <button type="button" onClick={handleEditSave} className="menu-action-btn save">Save</button>
            </div>
          </>
        )}
      </div>
      {/* Save button moved beside Cancel inside Change Menu */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={handleNotifyEveryone} disabled={loading} className="menu-action-btn notify">
          {loading ? 'Notifying...' : 'Notify Everyone'}
        </button>
        <button type="button" onClick={handleFinalize} className="menu-action-btn finalize" style={{ background: '#f56565', color: '#fff', fontWeight: 600 }}>
          Finalize
        </button>
      </div>
      {/* <form onSubmit={handleSubmit} className="secretary-form">
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
      </form> */}
      <div className="feedback-section" style={{ marginTop: 40, padding: 16, border: '1px solid #ccc', borderRadius: 8, maxWidth: 600 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>User Feedback on Current Menu</h2>
          <div style={{ marginBottom: 12, display: 'flex', gap: 16 }}>
            <div>
              <label style={{ fontWeight: 600, marginRight: 8 }}>Filter by Meal:</label>
              <select value={feedbackMealFilter} onChange={e => setFeedbackMealFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #667eea', fontSize: 16, background: '#f7fafc', color: '#333', minWidth: 140 }}>
                <option value="all">All</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 600, marginRight: 8 }}>Filter by Day:</label>
              <select value={feedbackDayFilter} onChange={e => setFeedbackDayFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #667eea', fontSize: 16, background: '#f7fafc', color: '#333', minWidth: 140 }}>
                <option value="all">All</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>
          {feedbackLoading ? <div>Loading feedback...</div> : (
            feedbacks.length === 0 ? <div>No feedback yet.</div> : (
              <ul style={{ paddingLeft: 0 }}>
                {feedbacks
                  .filter(fb => (feedbackMealFilter === 'all' || fb.meal === feedbackMealFilter) && (feedbackDayFilter === 'all' || fb.day === feedbackDayFilter))
                  .map((fb, idx) => (
                    <li key={idx} style={{ marginBottom: 12, listStyle: 'none', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                      <strong>{fb.day} - {fb.meal}</strong><br />
                      <span>{fb.description}</span>
                      {fb.userId && fb.userId.name && (
                        <div style={{ fontSize: 12, color: '#888' }}>By: {fb.userId.name} ({fb.userId.email})</div>
                      )}
                    </li>
                  ))}
              </ul>
            )
          )}
        </div>
    </div>
  );
};
