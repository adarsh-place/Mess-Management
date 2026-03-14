import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loadGoogleScript } from '../utils/googleScript';
import '../styles/Auth.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, googleLogin, loading } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      // Redirect based on user role
      if (response.user.role === 'secretary') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err?.message || String(err));
    }
  };

  // Google Sign-In button setup
  const [googleBtnError, setGoogleBtnError] = useState('');
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // 1. Define the callback for when a user signs in
    window.handleGoogle = async (response) => {
      try {
        const data = await googleLogin(response.credential);
        navigate('/dashboard'); 
      } catch (err) {
        setError(err?.message || "Google Login failed");
      }
    };

    // 2. Define the rendering logic
    const initializeGoogleBtn = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: window.handleGoogle,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 250,
        });
      }
    };

    // 3. Load script and init
    if (!clientId) {
      setGoogleBtnError('Google Client ID is missing.');
    } else {
      loadGoogleScript(() => {
        initializeGoogleBtn();
      });
    }

    // Cleanup: Remove global callback if component unmounts
    return () => {
      window.handleGoogle = null;
    };
  }, [googleLogin, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #f7fafc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', boxShadow: '0 8px 32px rgba(102,126,234,0.18)', borderRadius: 18, padding: '40px 32px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#667eea', marginBottom: 8 }}>BHR IIT Bhubaneswar</h2>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#333', marginBottom: 24 }}>Mess Login</h3>
        {error && <div style={{ color: '#f56565', fontWeight: 600, marginBottom: 16 }}>{String(error)}</div>}
        
        <div style={{ margin: '0 0 0 0', textAlign: 'center' }}>
          <div ref={googleBtnRef} style={{ display: 'inline-block', minHeight: 40 }}></div>
          {googleBtnError && (
            <div style={{ color: 'red', marginTop: 8 }}>{googleBtnError}</div>
          )}
        </div>
      </div>
    </div>
  );
};
