import { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement } from '../../services/announcementService';
import Spinner from '../../components/Spinner';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createAnnouncement({ title, body, category });
      setTitle('');
      setBody('');
      setCategory('');
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Announcements</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {showForm && (
        <form className="form-card" onSubmit={handleCreate}>
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="text" placeholder="Category (e.g. Utilities)" value={category} onChange={(e) => setCategory(e.target.value)} required />
          <textarea placeholder="Announcement details" value={body} onChange={(e) => setBody(e.target.value)} required />
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      )}

      {announcements.length === 0 ? (
        <p className="empty-state">No announcements yet.</p>
      ) : (
        <div className="card-list">
          {announcements.map((a) => (
            <div key={a.id} className="data-card">
              <p className="eyebrow">{a.category}</p>
              <h3>{a.title}</h3>
              <p>{a.body}</p>
              <p className="mono-value">{new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;