import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Secretary.css';

export const ManageMenuPage = () => {
  const [date, setDate] = useState('');
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  const timings = {
    breakfast: '8:00 AM - 9:00 AM',
    lunch: '1:00 PM - 2:00 PM',
    dinner: '8:00 PM - 9:00 PM',
  };
  const [editDay, setEditDay] = useState('');
  const [editMeal, setEditMeal] = useState('breakfast');
  const [editValue, setEditValue] = useState('');
  const defaultDay = { breakfast: '', lunch: '', dinner: '' };

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/menu');
      // Assume backend returns array, take latest
      const latest = res.data[0];
      if (latest && latest.breakfast && latest.lunch && latest.dinner) {
        // Convert backend format to frontend format
        const backendDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        const newMenu = {};
        backendDays.forEach(day => {
          newMenu[day] = {
            breakfast: (latest.breakfast[day] || []).join(', '),
            lunch: (latest.lunch[day] || []).join(', '),
            dinner: (latest.dinner[day] || []).join(', '),
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

  const getMonday = (d = new Date()) => {
    d = new Date(d);
    const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const handleSaveMenu = async () => {
    setLoading(true);
    try {
      // Convert frontend format to backend format
      const backendDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      console.log(backendDays);
      const daysObj = {};
      backendDays.forEach(day => {
        daysObj[day] = {
          breakfast: menu[day],
          lunch: menu[day],
          dinner: menu[day],        };
      });
      console.log(daysObj);
      await axios.post('http://localhost:5000/api/menu', {
        weekStart: getMonday(),
        days: daysObj,
      });
      setMessage('Menu saved to backend!');
      setTimeout(() => setMessage(''), 3000);
      fetchMenu();
    } catch (err) {
      setMessage('Error saving menu');
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
  const handleEditSave = () => {
    setMenu(prev => ({
      ...prev,
      [editDay]: {
        ...prev[editDay],
        [editMeal]: editValue,
      },
    }));
    setEditDay('');
  };

  return (
    <div className="secretary-container">
      <h1>Manage Menu</h1>
      {message && <div className="message">{message}</div>}
      <table className="menu-table" style={{ marginBottom: 32, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ width: '120px' }}>Day</th>
            <th style={{ width: '220px' }}>Breakfast<br /><span style={{ fontWeight: 'normal', fontSize: 12 }}>{timings.breakfast}</span></th>
            <th style={{ width: '220px' }}>Lunch<br /><span style={{ fontWeight: 'normal', fontSize: 12 }}>{timings.lunch}</span></th>
            <th style={{ width: '220px' }}>Dinner<br /><span style={{ fontWeight: 'normal', fontSize: 12 }}>{timings.dinner}</span></th>
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
            <button type="button" onClick={handleEditSave} style={{ marginRight: 8 }}>Save</button>
            <button type="button" onClick={() => setEditDay('')}>Cancel</button>
          </>
        )}
      </div>
      <button type="button" onClick={handleSaveMenu} disabled={loading} style={{ marginBottom: 24 }}>
        {loading ? 'Saving...' : 'Save Menu'}
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
