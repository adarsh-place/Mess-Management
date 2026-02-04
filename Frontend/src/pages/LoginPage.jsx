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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="error-message">{String(error)}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ margin: '32px 0 0 0', textAlign: 'center' }}>
          <div style={{ marginBottom: '8px', fontWeight: 500, color: '#555' }}>or</div>
          <div ref={googleBtnRef} style={{ display: 'inline-block', minHeight: 40 }}></div>
          {googleBtnError && (
            <div style={{ color: 'red', marginTop: 8 }}>{googleBtnError}</div>
          )}
        </div>
      </div>
    </div>
  );
};
