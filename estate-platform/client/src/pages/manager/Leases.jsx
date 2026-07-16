import { useState, useEffect } from 'react';
import { getLeases, createLease, endLease } from '../../services/leaseService';
import { getTenants } from '../../services/authService';
import { getUnits } from '../../services/unitService';
import Spinner from '../../components/Spinner';
import '../../styles/Leases.css';

const Leases = () => {
  const [leases, setLeases] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [vacantUnits, setVacantUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [leasesData, tenantsData, unitsData] = await Promise.all([
        getLeases(),
        getTenants(),
        getUnits(),
      ]);
      setLeases(leasesData);
      setTenants(tenantsData);
      setVacantUnits(unitsData.filter((u) => u.status === 'VACANT'));
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await createLease({
        tenantId,
        unitId,
        startDate,
        endDate,
        rentAmount: Number(rentAmount),
      });
      setTenantId('');
      setUnitId('');
      setStartDate('');
      setEndDate('');
      setRentAmount('');
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create lease');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnd = async (id) => {
    try {
      await endLease(id);
      fetchData();
    } catch (err) {
      setError('Failed to end lease');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="leases-page">
      <div className="leases-header">
        <h1>Leases</h1>
        <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Lease'}
        </button>
      </div>

      {error && <p className="leases-error">{error}</p>}

      {showForm && (
        <form className="lease-form" onSubmit={handleCreate}>
          <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} required>
            <option value="">Select tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>

          <select value={unitId} onChange={(e) => setUnitId(e.target.value)} required>
            <option value="">Select vacant unit</option>
            {vacantUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Rent amount"
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Lease'}
          </button>
        </form>
      )}

      {leases.length === 0 ? (
        <p className="leases-empty">No leases yet.</p>
      ) : (
        <div className="leases-list">
          {leases.map((lease) => (
            <div key={lease.id} className="lease-card">
              <div className="lease-card-info">
                <h3>{lease.tenant.name}</h3>
                <p>{lease.unit.label}</p>
                <p className="lease-dates">
                  {new Date(lease.startDate).toLocaleDateString()} –{' '}
                  {new Date(lease.endDate).toLocaleDateString()}
                </p>
                <span className={`status-badge status-${lease.status.toLowerCase()}`}>
                  {lease.status}
                </span>
              </div>
              {lease.status === 'ACTIVE' && (
                <button className="end-lease-btn" onClick={() => handleEnd(lease.id)}>
                  End Lease
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leases;