import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllRequests } from '../services/maintenanceService';
import './DashboardLayout.css';

const managerLinks = [
  { label: 'Dashboard', path: '/manager' },
  { label: 'Units', path: '/manager/units' },
  { label: 'Leases', path: '/manager/leases' },
  { label: 'Invoices', path: '/manager/invoices' },
  { label: 'Maintenance', path: '/manager/maintenance' },
  { label: 'Documents', path: '/manager/documents' },
  { label: 'Announcements', path: '/manager/announcements' },
];

const tenantLinks = [
  { label: 'Dashboard', path: '/tenant' },
  { label: 'My Lease', path: '/tenant/lease' },
  { label: 'Invoices', path: '/tenant/invoices' },
  { label: 'Maintenance', path: '/tenant/maintenance' },
  { label: 'Documents', path: '/tenant/documents' },
  { label: 'Announcements', path: '/tenant/announcements' },
];

const DashboardLayout = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMaintenanceCount, setOpenMaintenanceCount] = useState(0);

  const links = user?.role === 'MANAGER' ? managerLinks : tenantLinks;

  useEffect(() => {
    if (user?.role !== 'MANAGER') return;

    const fetchOpenCount = async () => {
      try {
        const requests = await getAllRequests();
        setOpenMaintenanceCount(requests.filter((r) => r.status !== 'COMPLETED').length);
      } catch {
        // silent fail — notification count isn't critical path
      }
    };

    fetchOpenCount();
  }, [user]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleNavClick = () => setMenuOpen(false);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <span className="dashboard-brand">Estate Platform</span>
        </div>

        <nav className="dashboard-nav desktop-nav">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? 'nav-link active' : 'nav-link'}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="dashboard-header-right desktop-nav">
          {user?.role === 'MANAGER' && (
            <Link to="/manager/maintenance" className="bell-btn" aria-label="Open maintenance requests">
              <Bell size={17} />
              {openMaintenanceCount > 0 && <span className="bell-dot">{openMaintenanceCount}</span>}
            </Link>
          )}
          <span className="dashboard-user">{user?.name}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Log out
          </button>
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {menuOpen && (
        <nav className="mobile-nav">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? 'mobile-nav-link active' : 'mobile-nav-link'}
              onClick={handleNavClick}
            >
              {link.label}
            </Link>
          ))}
          <button className="mobile-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Log out
          </button>
        </nav>
      )}

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;