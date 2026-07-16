import { useState, useEffect } from 'react';
import { getInvoices, createInvoice } from '../../services/invoiceService';
import { recordPayment } from '../../services/paymentService';
import { getLeases } from '../../services/leaseService';
import Spinner from '../../components/Spinner';

const statusBadge = {
  PENDING: 'badge-neutral',
  PARTIAL: 'badge-warning',
  PAID: 'badge-success',
  OVERDUE: 'badge-danger',
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [activeLeases, setActiveLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [leaseId, setLeaseId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState({});

  const fetchData = async () => {
    try {
      const [invoicesData, leasesData] = await Promise.all([getInvoices(), getLeases()]);
      setInvoices(invoicesData);
      setActiveLeases(leasesData.filter((l) => l.status === 'ACTIVE'));
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
      await createInvoice({ leaseId, amount: Number(amount), dueDate });
      setLeaseId('');
      setAmount('');
      setDueDate('');
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (invoiceId) => {
    const amt = paymentAmounts[invoiceId];
    if (!amt) return;
    try {
      await recordPayment({ invoiceId, amount: Number(amt), method: 'bank_transfer' });
      setPaymentAmounts({ ...paymentAmounts, [invoiceId]: '' });
      fetchData();
    } catch (err) {
      setError('Failed to record payment');
    }
  };

  const totalPaid = (invoice) => invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Invoices</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Invoice'}
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {showForm && (
        <form className="form-card" onSubmit={handleCreate}>
          <select value={leaseId} onChange={(e) => setLeaseId(e.target.value)} required>
            <option value="">Select lease</option>
            {activeLeases.map((l) => (
              <option key={l.id} value={l.id}>
                {l.tenant.name} — {l.unit.label}
              </option>
            ))}
          </select>
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </form>
      )}

      {invoices.length === 0 ? (
        <p className="empty-state">No invoices yet.</p>
      ) : (
        <div className="card-list">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="data-card">
              <div className="data-card-row">
                <div>
                  <h3>{invoice.lease.tenant.name}</h3>
                  <p>{invoice.lease.unit.label}</p>
                  <p className="mono-value">₦{Number(invoice.amount).toLocaleString()} total · Paid ₦{totalPaid(invoice).toLocaleString()}</p>
                  <p className="mono-value">Due {new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${statusBadge[invoice.status]}`}>{invoice.status}</span>
              </div>

              {invoice.status !== 'PAID' && (
                <div className="payment-row">
                  <input
                    type="number"
                    placeholder="Payment amount"
                    value={paymentAmounts[invoice.id] || ''}
                    onChange={(e) => setPaymentAmounts({ ...paymentAmounts, [invoice.id]: e.target.value })}
                  />
                  <button className="btn-secondary" onClick={() => handleRecordPayment(invoice.id)}>
                    Record Payment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invoices;