import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Menu.css';

export const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/menu');
        setMenus(response.data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div className="menu-container">
      <h1>Mess Menu</h1>
      {loading ? (
        <p>Loading...</p>
      ) : menus.length > 0 ? (
        <div className="menus-list">
          {menus.map((menu) => (
            <div key={menu._id} className="menu-card">
              <h2>{new Date(menu.date).toLocaleDateString()}</h2>
              <div className="meal-section">
                <h3>Breakfast</h3>
                <ul>
                  {menu.breakfast.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="meal-section">
                <h3>Lunch</h3>
                <ul>
                  {menu.lunch.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="meal-section">
                <h3>Dinner</h3>
                <ul>
                  {menu.dinner.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No menu available</p>
      )}
    </div>
  );
};
