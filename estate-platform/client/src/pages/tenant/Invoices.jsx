import { useState, useEffect } from 'react';
import { getMyInvoices } from '../../services/invoiceService';
import Spinner from '../../components/Spinner';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getMyInvoices();
        setInvoices(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('No active lease found.');
        } else {
          setError('Failed to load invoices');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const totalPaid = (invoice) =>
    invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) return <Spinner />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>My Invoices</h1>

      {invoices.length === 0 ? (
        <p>No invoices yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {invoices.map((invoice) => (
            <div key={invoice.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
              <p>Amount: ₦{Number(invoice.amount).toLocaleString()}</p>
              <p>Paid so far: ₦{totalPaid(invoice).toLocaleString()}</p>
              <p>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
              <p>Status: <strong>{invoice.status}</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invoices;