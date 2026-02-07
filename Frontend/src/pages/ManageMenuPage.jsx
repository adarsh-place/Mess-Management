import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Secretary.css';

export const ManageMenuPage = () => {
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const days = [
    'Common','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  const [timings, setTimings] = useState(['8:00 AM - 9:00 AM','1:00 PM - 2:00 PM','8:00 PM - 9:00 PM']);
  
  const [editDay, setEditDay] = useState('');
  const [editMeal, setEditMeal] = useState('breakfast');
  const [editValue, setEditValue] = useState('');
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
      await axios.post('http://localhost:5000/api/menu/email');
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
      await axios.put('http://localhost:5000/api/menu/timings', {timings
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
      const res = await axios.get('http://localhost:5000/api/menu');
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
      setEditValue((menu[e.target.value]?.breakfast ?? ''));
    }
  };
  const handleMealChange = (e) => {
    setEditMeal(e.target.value);
    setEditValue((menu[editDay]?.[e.target.value] ?? ''));
  };
  const handleEditValueChange = (e) => {
    setEditValue(e.target.value);
  };
  const handleEditSave = async () => {
    setLoading(true);
    try {
      // Update local state
      setMenu(prev => ({
        ...prev,
        [editDay]: {
          ...prev[editDay],
          [editMeal]: editValue,
        },
      }));
      // Prepare days object in array format
      const backendDays = ['Common','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      const daysObj = {};
      backendDays.forEach(day => {
        daysObj[day] = [
          (day === editDay && editMeal === 'breakfast') ? editValue : menu[day]?.breakfast || '',
          (day === editDay && editMeal === 'lunch') ? editValue : menu[day]?.lunch || '',
          (day === editDay && editMeal === 'dinner') ? editValue : menu[day]?.dinner || ''
        ];
      });
      await axios.put('http://localhost:5000/api/menu', {
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

  return (
    <div className="secretary-container">
      <h1>Manage Menu</h1>
      {message && <div className="message">{message}</div>}
      <table className="menu-table" style={{ marginBottom: 32, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
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
              <input type="text" value={timings[0]} onChange={e => setTimings([e.target.value, timings[1], timings[2]])} style={{ width: '90%' }} />
            </td>
            <td>
              <input type="text" value={timings[1]} onChange={e => setTimings([timings[0], e.target.value, timings[2]])} style={{ width: '90%' }} />
            </td>
            <td>
              <input type="text" value={timings[2]} onChange={e => setTimings([timings[0], timings[1], e.target.value])} style={{ width: '90%' }} />
            </td>
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day}>
              <td style={{ wordBreak: 'break-word', padding: '8px' }}>{day}</td>
              <td style={{ wordBreak: 'break-word', padding: '8px' }}>{(menu[day]?.breakfast ?? defaultDay.breakfast)}</td>
              <td style={{ wordBreak: 'break-word', padding: '8px' }}>{(menu[day]?.lunch ?? defaultDay.lunch)}</td>
              <td style={{ wordBreak: 'break-word', padding: '8px' }}>{(menu[day]?.dinner ?? defaultDay.dinner)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="edit-menu-form" style={{ marginBottom: 32, padding: 16, border: '1px solid #ccc', borderRadius: 8, maxWidth: 600 }}>
        <h3>Change Menu</h3>
        <div style={{ marginBottom: 8 }}>
          <label>Day:&nbsp;</label>
          <select value={editDay} onChange={handleEditDayChange}>
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
              <select value={editMeal} onChange={handleMealChange}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Menu Items:&nbsp;</label>
              <input type="text" value={editValue} onChange={handleEditValueChange} style={{ width: 300 }} />
            </div>
            <button type="button" onClick={() => setEditDay('')}>Cancel</button>
          </>
        )}
      </div>
      <button type="button" onClick={handleEditSave} style={{ marginRight: 8 }}>Save</button>
      <button type="button" onClick={handleNotifyEveryone} disabled={loading} style={{ marginBottom: 24 }}>
        {loading ? 'Notifying...' : 'Notify Everyone'}
      </button>
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
    </div>
  );
};
