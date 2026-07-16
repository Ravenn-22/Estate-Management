import { useState, useEffect } from 'react';
import { getMyDocuments } from '../../services/documentService';
import Spinner from '../../components/Spinner';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await getMyDocuments();
        setDocuments(data);
      } catch (err) {
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>My Documents</h1>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {documents.length === 0 ? (
        <p className="empty-state">No documents yet.</p>
      ) : (
        <div className="card-list">
          {documents.map((doc) => (
            <div key={doc.id} className="data-card data-card-row">
              <div>
                <p className="eyebrow">{doc.type}</p>
                <p className="mono-value">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
              </div>
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="link-view">View</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;