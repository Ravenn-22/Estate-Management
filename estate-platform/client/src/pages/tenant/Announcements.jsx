import { useState, useEffect } from 'react';
import { getAnnouncements } from '../../services/announcementService';
import Spinner from '../../components/Spinner';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
    fetchAnnouncements();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Announcements</h1>
      </div>

      {error && <p className="error-banner">{error}</p>}

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