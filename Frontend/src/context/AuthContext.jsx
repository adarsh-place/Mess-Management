import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();


// Helper function to decode JWT and extract user info
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
    
  // Google login
    const googleLogin = async (idToken) => {
      setLoading(true);
      try {
        const response = await axios.post('http://localhost:5000/api/auth/google', { idToken });
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        return response.data;
      } catch (error) {
        throw error.response?.data?.message || 'Google login failed';
      } finally {
        setLoading(false);
      }
    };

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

      // If user data is stored, use it; otherwise decode from token
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        const decoded = decodeToken(storedToken);
        if (decoded && decoded.id) {
          // Create a basic user object from token
          setUser({
            id: decoded.id,
            _id: decoded.id,
          });
        }
      }
    }
    setLoading(false);
  }, []);


  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
