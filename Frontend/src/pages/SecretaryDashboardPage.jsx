import { useNavigate } from 'react-router-dom';
import '../styles/Secretary.css';

export const SecretaryDashboardPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Overview',
      description: 'View dashboard statistics and recent activity',
      icon: '📊',
      route: '/secretary/overview',
    },
    {
      title: 'Complaints',
      description: 'View and respond to student complaints',
      icon: '📝',
      route: '/secretary/complaints',
    },
    {
      title: 'Polls',
      description: 'Create and manage polls for students',
      icon: '🗳️',
      route: '/secretary/polls',
    },
    {
      title: 'View Feedback',
      description: 'View meal ratings and feedback analytics',
      icon: '⭐',
      route: '/secretary/feedback',
    },
    {
      title: 'Menu',
      description: 'Create and manage mess menu',
      icon: '🍽️',
      route: '/secretary/menu',
    },
    {
      title: 'Send Notices',
      description: 'Broadcast notices to all students',
      icon: '📢',
      route: '/secretary/notices',
    },
    {
      title: 'Students',
      description: 'Add or Remove students',
      icon: '📢',
      route: '/manage-students',
    },
  ];

  return (
    <div className="secretary-menu-container">
      <h1>Secretary Dashboard</h1>
      <p className="subtitle">Manage all mess operations from here</p>

      <div className="features-grid">
        {features.map((feature) => (
          <div
            key={feature.route}
            className="feature-card"
            onClick={() => navigate(feature.route)}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <button className="feature-btn">Go to {feature.title}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
