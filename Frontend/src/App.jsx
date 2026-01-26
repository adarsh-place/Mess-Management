import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import './App.css';

// Import pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { SecretaryDashboard } from './pages/SecretaryDashboard';
import { SecretaryMenuPage } from './pages/SecretaryMenuPage';
import { PollsPage } from './pages/PollsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { MenuPage } from './pages/MenuPage';
import { SendNoticePage } from './pages/SendNoticePage';
import { ManageMenuPage } from './pages/ManageMenuPage';
import { ManagePollsPage } from './pages/ManagePollsPage';
import { ViewFeedbackPage } from './pages/ViewFeedbackPage';
import { ManageComplaintsPage } from './pages/ManageComplaintsPage';
import { SecretaryOverviewPage } from './pages/SecretaryOverviewPage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  console.log(token, user);

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Public Route — redirects authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/dashboard" /> : children;
};

// Role-based Dashboard Component
const DashboardRouter = () => {
  const { user } = useContext(AuthContext);
  
  if (user?.role === 'secretary') {
    return <SecretaryMenuPage />;
  }
  
  return <StudentDashboard />;
};

// Navigation Component
const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a href="/dashboard" className="nav-logo">
          Mess Management System
        </a>
        <ul className="nav-menu">
          <li className="nav-item">
            <span className="nav-user">Welcome, {user.name}</span>
          </li>
          <li className="nav-item">
            <button onClick={logout} className="nav-logout">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

function App() {
  // Do not consume AuthContext at the top-level of App — the provider is rendered below.
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

          {/* Dashboard Route - Shows different content based on role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="role-container">
                  <DashboardRouter />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/polls"
            element={
              <ProtectedRoute>
                <PollsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <ComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <MenuPage />
              </ProtectedRoute>
            }
          />

          {/* Secretary Routes - Organized Structure */}
          <Route
            path="/secretary/overview"
            element={
              <ProtectedRoute requiredRole="secretary">
                <SecretaryOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/complaints"
            element={
              <ProtectedRoute requiredRole="secretary">
                <ManageComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/polls"
            element={
              <ProtectedRoute requiredRole="secretary">
                <ManagePollsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/feedback"
            element={
              <ProtectedRoute requiredRole="secretary">
                <ViewFeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/menu"
            element={
              <ProtectedRoute requiredRole="secretary">
                <ManageMenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secretary/notices"
            element={
              <ProtectedRoute requiredRole="secretary">
                <SendNoticePage />
              </ProtectedRoute>
            }
          />

          {/* Legacy Secretary Routes (Backward Compatibility) */}
          <Route
            path="/manage-polls"
            element={
              <ProtectedRoute requiredRole="secretary">
                <ManagePollsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-menu"
            element={
              <ProtectedRoute requiredRole="secretary">
                <ManageMenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/send-notice"
            element={
              <ProtectedRoute requiredRole="secretary">
                <SendNoticePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-complaints"
            element={
              <ProtectedRoute requiredRole="secretary">
                <ManageComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-feedback"
            element={
              <ProtectedRoute>
                <ViewFeedbackPage />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
