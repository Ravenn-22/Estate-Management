import { useAuth } from '../context/AuthContext';

const TenantDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>This is your tenant dashboard overview.</p>
    </div>
  );
};

export default TenantDashboard;