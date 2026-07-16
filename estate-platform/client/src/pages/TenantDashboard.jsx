import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, FileText, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyLease } from '../services/leaseService';
import { getMyInvoices } from '../services/invoiceService';
import { getMyRequests } from '../services/maintenanceService';
import { getAnnouncements } from '../services/announcementService';
import Spinner from '../components/Spinner';
import '../styles/TenantDashboard.css';

const invoiceBadge = {
  PENDING: 'badge-neutral',
  PARTIAL: 'badge-warning',
  PAID: 'badge-success',
  OVERDUE: 'badge-danger',
};

const TenantDashboard = () => {
  const { user } = useAuth();
  const [lease, setLease] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noLease, setNoLease] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const leaseData = await getMyLease().catch((err) => {
          if (err.response?.status === 404) {
            setNoLease(true);
            return null;
          }
          throw err;
        });
        setLease(leaseData);

        const [invoicesData, requestsData, announcementsData] = await Promise.all([
          leaseData ? getMyInvoices() : Promise.resolve([]),
          getMyRequests(),
          getAnnouncements(),
        ]);

        setInvoices(invoicesData);
        setRequests(requestsData);
        setAnnouncements(announcementsData);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const nextDueInvoice = useMemo(() => {
    return [...invoices]
      .filter((inv) => inv.status !== 'PAID')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
  }, [invoices]);

  const openRequestsCount = useMemo(
    () => requests.filter((r) => r.status !== 'COMPLETED').length,
    [requests]
  );

  const recentAnnouncements = useMemo(
    () => [...announcements].slice(0, 3),
    [announcements]
  );

  if (loading) return <Spinner />;

  return (
    <div className="tnd-page">
      <div className="page-header">
        <h1>Welcome, {user?.name}</h1>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {noLease ? (
        <p className="empty-state">No active lease found. Contact your estate manager.</p>
      ) : (
        <>
          <div className="tnd-stats-grid">
            <div className="tnd-stat-card">
              <p className="eyebrow">My Unit</p>
              <div className="tnd-stat-value">{lease?.unit?.label}</div>
              <p className="tnd-stat-sub">
                Lease ends {lease ? new Date(lease.endDate).toLocaleDateString() : '—'}
              </p>
            </div>

            <div className="tnd-stat-card">
              <p className="eyebrow">Next Payment Due</p>
              {nextDueInvoice ? (
                <>
                  <div className="tnd-stat-value mono-value">
                    ₦{Number(nextDueInvoice.amount).toLocaleString()}
                  </div>
                  <p className="tnd-stat-sub">
                    Due {new Date(nextDueInvoice.dueDate).toLocaleDateString()} ·{' '}
                    <span className={`badge ${invoiceBadge[nextDueInvoice.status]}`}>
                      {nextDueInvoice.status}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <div className="tnd-stat-value">—</div>
                  <p className="tnd-stat-sub">No pending invoices</p>
                </>
              )}
            </div>

            <div className="tnd-stat-card">
              <p className="eyebrow">Maintenance Requests</p>
              <div className="tnd-stat-value">{openRequestsCount}</div>
              <p className="tnd-stat-sub">Currently open</p>
            </div>
          </div>

          <div className="tnd-grid-lower">
            <div className="data-card">
              <div className="tnd-card-header">
                <h2><Wrench size={15} /> Recent Requests</h2>
                <Link to="/tenant/maintenance" className="link-view">View all</Link>
              </div>
              {requests.length === 0 ? (
                <p className="empty-state">No maintenance requests yet.</p>
              ) : (
                requests.slice(0, 4).map((r) => (
                  <div key={r.id} className="tnd-row">
                    <div>
                      <p>{r.category}</p>
                      <p className="tnd-row-sub">{r.description}</p>
                    </div>
                    <span className="badge badge-neutral">{r.status}</span>
                  </div>
                ))
              )}
            </div>

            <div className="data-card">
              <div className="tnd-card-header">
                <h2><Megaphone size={15} /> Announcements</h2>
                <Link to="/tenant/announcements" className="link-view">View all</Link>
              </div>
              {recentAnnouncements.length === 0 ? (
                <p className="empty-state">No announcements yet.</p>
              ) : (
                recentAnnouncements.map((a) => (
                  <div key={a.id} className="tnd-row">
                    <div>
                      <p className="eyebrow">{a.category}</p>
                      <p>{a.title}</p>
                    </div>
                    <span className="mono-value tnd-row-date">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="data-card tnd-docs-hint">
            <FileText size={15} />
            <span>Need your lease agreement or receipts?</span>
            <Link to="/tenant/documents" className="link-view">Go to Documents</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default TenantDashboard;