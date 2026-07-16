import { useState, useEffect, useMemo } from 'react';
import { BedDouble, Bath, Wrench, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getUnits } from '../services/unitService';
import { getLeases } from '../services/leaseService';
import { getInvoices } from '../services/invoiceService';
import { getAllRequests } from '../services/maintenanceService';
import { getTenants } from '../services/authService';
import Spinner from '../components/Spinner';
import '../styles/ManagerDashboard.css';

const priorityBadge = {
  HIGH: 'badge-danger',
  MEDIUM: 'badge-warning',
  LOW: 'badge-info',
};

const getLastSixMonths = (invoices) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('default', { month: 'short' }), total: 0 });
  }
  invoices.forEach((inv) => {
    (inv.payments || []).forEach((p) => {
      const paidDate = new Date(p.paidAt);
      const key = `${paidDate.getFullYear()}-${paidDate.getMonth()}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) bucket.total += Number(p.amount) || 0;
    });
  });
  return months;
};

const ManagerDashboard = () => {
  const [units, setUnits] = useState([]);
  const [leases, setLeases] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaseTab, setLeaseTab] = useState('recent');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [u, l, i, r, t] = await Promise.all([
          getUnits(), getLeases(), getInvoices(), getAllRequests(), getTenants(),
        ]);
        setUnits(u);
        setLeases(l);
        setInvoices(i);
        setRequests(r);
        setTenants(t);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const stats = useMemo(() => {
    const totalUnits = units.length;
    const occupiedUnits = units.filter((u) => u.status === 'OCCUPIED').length;
    const occupancyRate = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const outstanding = invoices.reduce((sum, inv) => {
      if (inv.status === 'PAID') return sum;
      const paid = (inv.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
      return sum + (Number(inv.amount) - paid);
    }, 0);

    const months = getLastSixMonths(invoices);
    const currentMonth = months[months.length - 1].total;
    const prevMonth = months[months.length - 2]?.total || 0;
    const monthChange = prevMonth ? Math.round(((currentMonth - prevMonth) / prevMonth) * 100) : 0;

    return { totalTenants: tenants.length, occupiedUnits, totalUnits, occupancyRate, monthlyIncome: currentMonth, monthChange, outstanding, months };
  }, [units, invoices, tenants]);

  const maxMonthly = Math.max(...stats.months.map((m) => m.total), 1);

  const recentLeases = useMemo(
    () => [...leases].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).slice(0, 4),
    [leases]
  );

  const endingSoonLeases = useMemo(() => {
    const now = new Date();
    return leases
      .filter((l) => l.status === 'ACTIVE')
      .map((l) => ({ ...l, daysLeft: Math.ceil((new Date(l.endDate) - now) / (1000 * 60 * 60 * 24)) }))
      .filter((l) => l.daysLeft >= 0 && l.daysLeft <= 30)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);
  }, [leases]);

  const visibleLeases = leaseTab === 'recent' ? recentLeases : endingSoonLeases;

  const openMaintenance = useMemo(
    () => [...requests].filter((r) => r.status !== 'COMPLETED').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [requests]
  );

  const recentPayments = useMemo(() => {
    const flat = [];
    invoices.forEach((inv) => {
      (inv.payments || []).forEach((p) => {
        flat.push({
          id: p.id,
          tenant: inv.lease?.tenant?.name,
          unit: inv.lease?.unit?.label,
          date: p.paidAt,
          amount: p.amount,
          status: inv.status,
        });
      });
    });
    return flat.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  }, [invoices]);

  if (loading) return <Spinner />;

  return (
    <div className="mgrd-page">
      <div className="page-header">
        <h1>Overview</h1>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="mgrd-stats-grid">
        <div className="mgrd-stat-card">
          <p className="eyebrow">Total Tenants</p>
          <div className="mgrd-stat-value">{stats.totalTenants}</div>
          <p className="mgrd-stat-sub">Across all units</p>
        </div>

        <div className="mgrd-stat-card">
          <p className="eyebrow">Occupancy Rate</p>
          <div className="mgrd-stat-value">{stats.occupancyRate}%</div>
          <p className="mgrd-stat-sub">{stats.occupiedUnits} of {stats.totalUnits} occupied</p>
        </div>

        <div className="mgrd-stat-card">
          <p className="eyebrow">Monthly Income</p>
          <div className="mgrd-stat-value mono-value">₦{stats.monthlyIncome.toLocaleString()}</div>
          <p className="mgrd-stat-sub">
            <span className={stats.monthChange >= 0 ? 'mgrd-change up' : 'mgrd-change down'}>
              {stats.monthChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(stats.monthChange)}%
            </span>{' '}
            vs last month
          </p>
        </div>

        <div className="mgrd-stat-card">
          <p className="eyebrow">Outstanding</p>
          <div className="mgrd-stat-value mono-value">₦{stats.outstanding.toLocaleString()}</div>
          <p className="mgrd-stat-sub">Across unpaid invoices</p>
        </div>
      </div>

      <div className="mgrd-grid-main">
        <div className="mgrd-chart-card">
          <div className="mgrd-chart-header">
            <h2>Income, Last 6 Months</h2>
          </div>

          {stats.months.every((m) => m.total === 0) ? (
            <p className="empty-state">No payment history yet.</p>
          ) : (
            <svg viewBox="0 0 420 190" width="100%" height="190" preserveAspectRatio="xMidYMid meet">
              {stats.months.map((m, i) => {
                const barWidth = 32;
                const gap = (420 - barWidth * 6) / 7;
                const x = gap + i * (barWidth + gap);
                const height = (m.total / maxMonthly) * 130;
                const y = 150 - height;
                return (
                  <g key={m.key}>
                    <rect x={x} y={y} width={barWidth} height={height} rx="4" fill="var(--color-accent)" />
                    <text x={x + barWidth / 2} y={172} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)">
                      {m.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        <div className="mgrd-leases-panel">
          <div className="mgrd-leases-panel-header">
            <h2>Leases</h2>
            <div className="mgrd-tab-group">
              <button className={leaseTab === 'recent' ? 'mgrd-tab active' : 'mgrd-tab'} onClick={() => setLeaseTab('recent')}>Recent</button>
              <button className={leaseTab === 'ending' ? 'mgrd-tab active' : 'mgrd-tab'} onClick={() => setLeaseTab('ending')}>Ending Soon</button>
            </div>
          </div>

          {visibleLeases.length === 0 ? (
            <p className="empty-state">{leaseTab === 'recent' ? 'No leases yet.' : 'No leases ending in the next 30 days.'}</p>
          ) : (
            <div className="mgrd-lease-list">
              {visibleLeases.map((l) => (
                <div key={l.id} className="mgrd-lease-mini">
                  <div className="mgrd-lease-mini-top">
                    <h3>{l.unit.label}</h3>
                    <span className={`badge ${l.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>{l.status}</span>
                  </div>
                  <div className="mgrd-lease-facts">
                    <span><BedDouble size={12} /> {l.unit.bedrooms ?? '—'} Bed</span>
                    <span><Bath size={12} /> {l.unit.bathrooms ?? '—'} Bath</span>
                  </div>
                  <p className="mono-value">₦{Number(l.rentAmount).toLocaleString()}/yr</p>
                  <div className="mgrd-lease-tenant-row">
                    <span>{l.tenant.name}</span>
                    <span className="mono-value">{new Date(l.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mgrd-grid-lower">
        <div className="data-card">
          <h2>Open Maintenance</h2>
          {openMaintenance.length === 0 ? (
            <p className="empty-state">No open maintenance requests.</p>
          ) : (
            openMaintenance.map((r) => (
              <div key={r.id} className="mgrd-maint-row">
                <div className="mgrd-maint-icon"><Wrench size={16} /></div>
                <div className="mgrd-maint-info">
                  <p>{r.category}: {r.description}</p>
                  <p className="mgrd-maint-sub">{r.tenant.name} · {r.unit.label}</p>
                </div>
                <span className={`badge ${priorityBadge[r.priority]}`}>{r.priority}</span>
              </div>
            ))
          )}
        </div>

        <div className="data-card">
          <h2>Recent Payments</h2>
          {recentPayments.length === 0 ? (
            <p className="empty-state">No payments recorded yet.</p>
          ) : (
            <div className="mgrd-table-wrap">
              <table className="mgrd-table">
                <thead>
                  <tr><th>Tenant</th><th>Unit</th><th>Date</th><th>Amount</th></tr>
                </thead>
                <tbody>
                  {recentPayments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.tenant}</td>
                      <td>{p.unit}</td>
                      <td className="mono-value">{new Date(p.date).toLocaleDateString()}</td>
                      <td className="mono-value">₦{Number(p.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;