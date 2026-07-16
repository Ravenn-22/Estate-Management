import { useState, useEffect } from 'react';
import { getAllDocuments, uploadDocument } from '../../services/documentService';
import { getTenants } from '../../services/authService';
import Spinner from '../../components/Spinner';

const docTypes = ['LEASE', 'RECEIPT', 'NOTICE', 'RULES'];

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('LEASE');
  const [tenantId, setTenantId] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [docsData, tenantsData] = await Promise.all([getAllDocuments(), getTenants()]);
      setDocuments(docsData);
      setTenants(tenantsData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('type', type);
    formData.append('tenantId', tenantId);
    formData.append('file', file);

    try {
      await uploadDocument(formData);
      setType('LEASE');
      setTenantId('');
      setFile(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Documents</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Upload Document'}
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {showForm && (
        <form className="form-card" onSubmit={handleUpload}>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {docTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={tenantId} onChange={(e) => setTenantId(e.target.value)} required>
            <option value="">Select tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      )}

      {documents.length === 0 ? (
        <p className="empty-state">No documents yet.</p>
      ) : (
        <div className="card-list">
          {documents.map((doc) => (
            <div key={doc.id} className="data-card data-card-row">
              <div>
                <p className="eyebrow">{doc.type}</p>
                <h3>{doc.tenant?.name || 'Unassigned'}</h3>
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