import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ViewMenu.css';   
import { backend } from '../../constant.js';

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
                <td className="menu-table-cell">{(menu[day]?.breakfast ?? defaultDay.breakfast)}</td>
                <td className="menu-table-cell">{(menu[day]?.lunch ?? defaultDay.lunch)}</td>
                <td className="menu-table-cell">{(menu[day]?.dinner ?? defaultDay.dinner)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
};
