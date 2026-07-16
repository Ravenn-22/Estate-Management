import { useState, useEffect } from 'react';
import { getMyLease } from '../../services/leaseService';
import Spinner from '../../components/Spinner';
import '../../styles/MyLease.css';

const MyLease = () => {
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLease = async () => {
      try {
        const data = await getMyLease();
        setLease(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('No active lease found. Contact your estate manager.');
        } else {
          setError('Failed to load lease details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLease();
  }, []);

  if (loading) return <Spinner />;

  if (error) return <p className="mylease-error">{error}</p>;

  return (
    <div className="mylease-page">
      <h1>My Lease</h1>

      <div className="mylease-card">
        <div className="mylease-row">
          <span className="mylease-label">Unit</span>
          <span className="mylease-value">{lease.unit.label}</span>
        </div>

        <div className="mylease-row">
          <span className="mylease-label">Rent Amount</span>
          <span className="mylease-value">₦{Number(lease.rentAmount).toLocaleString()}/year</span>
        </div>

        <div className="mylease-row">
          <span className="mylease-label">Lease Start</span>
          <span className="mylease-value">{new Date(lease.startDate).toLocaleDateString()}</span>
        </div>

        <div className="mylease-row">
          <span className="mylease-label">Lease End</span>
          <span className="mylease-value">{new Date(lease.endDate).toLocaleDateString()}</span>
        </div>

        <div className="mylease-row">
          <span className="mylease-label">Status</span>
          <span className={`status-badge status-${lease.status.toLowerCase()}`}>
            {lease.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MyLease;