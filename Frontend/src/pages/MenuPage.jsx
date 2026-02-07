import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Menu.css';

export const MenuPage = () => {
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
      const res = await axios.get('http://localhost:5000/api/menu');
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
    <div className="student-menu-container" style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>Mess Menu</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="menu-table" style={{ marginBottom: 32, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Day</th>
              <th style={{ width: '220px' }}>Breakfast<br /><span style={{ fontWeight: 'normal', fontSize: 12 }}>{timings[0]}</span></th>
              <th style={{ width: '220px' }}>Lunch<br /><span style={{ fontWeight: 'normal', fontSize: 12 }}>{timings[1]}</span></th>
              <th style={{ width: '220px' }}>Dinner<br /><span style={{ fontWeight: 'normal', fontSize: 12 }}>{timings[2]}</span></th>
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
      )}
    </div>
  );
};
