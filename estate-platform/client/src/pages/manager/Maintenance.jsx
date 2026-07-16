import { useState, useEffect } from 'react';
import { getAllRequests, updateRequestStatus } from '../../services/maintenanceService';
import Spinner from '../../components/Spinner';

const statusOptions = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];

const statusBadge = {
  SUBMITTED: 'badge-neutral',
  ASSIGNED: 'badge-info',
  IN_PROGRESS: 'badge-warning',
  COMPLETED: 'badge-success',
};

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch (err) {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateRequestStatus(id, status);
      fetchRequests();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Maintenance Requests</h1>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {requests.length === 0 ? (
        <p className="empty-state">No requests yet.</p>
      ) : (
        <div className="card-list">
          {requests.map((r) => (
            <div key={r.id} className="data-card">
              <div className="data-card-row">
                <div>
                  <h3>{r.tenant.name}</h3>
                  <p>{r.unit.label}</p>
                  <p>{r.category}: {r.description}</p>
                  <p className="eyebrow">{r.priority} priority</p>
                </div>
                <span className={`badge ${statusBadge[r.status]}`}>{r.status}</span>
              </div>
              {r.photoUrls?.length > 0 && (
                <div className="photo-row">
                  {r.photoUrls.map((url) => (
                    <img key={url} src={url} alt="issue" className="photo-thumb" />
                  ))}
                </div>
              )}
              <select className="select-inline" value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Maintenance;