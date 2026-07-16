import { useState, useEffect } from 'react';
import { getMyRequests, createRequest } from '../../services/maintenanceService';
import { getMyLease } from '../../services/leaseService';
import Spinner from '../../components/Spinner';

const priorities = ['LOW', 'MEDIUM', 'HIGH'];

const statusBadge = {
  SUBMITTED: 'badge-neutral',
  ASSIGNED: 'badge-info',
  IN_PROGRESS: 'badge-warning',
  COMPLETED: 'badge-success',
};

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [unitId, setUnitId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [requestsData, leaseData] = await Promise.all([getMyRequests(), getMyLease()]);
      setRequests(requestsData);
      setUnitId(leaseData.unitId);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('unitId', unitId);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('priority', priority);
    photos.forEach((file) => formData.append('photos', file));

    try {
      await createRequest(formData);
      setCategory('');
      setDescription('');
      setPriority('MEDIUM');
      setPhotos([]);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Maintenance Requests</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <input type="text" placeholder="Category (e.g. Plumbing)" value={category} onChange={(e) => setCategory(e.target.value)} required />
          <textarea placeholder="Describe the issue" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input type="file" multiple accept="image/*" onChange={(e) => setPhotos(Array.from(e.target.files))} />
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      )}

      {requests.length === 0 ? (
        <p className="empty-state">No maintenance requests yet.</p>
      ) : (
        <div className="card-list">
          {requests.map((r) => (
            <div key={r.id} className="data-card">
              <div className="data-card-row">
                <div>
                  <p className="eyebrow">{r.priority} priority</p>
                  <h3>{r.category}</h3>
                  <p>{r.description}</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Maintenance;