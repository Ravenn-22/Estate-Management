import { useState, useEffect } from "react";
import {
  getUnits,
  createUnit,
  updateUnitStatus,
} from "../../services/unitService";
import "../../styles/Units.css";
import Spinner from "../../components/Spinner";

const statusOptions = ["VACANT", "OCCUPIED", "RESERVED", "MAINTENANCE"];

const Units = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUnits = async () => {
    try {
      const data = await getUnits();
      setUnits(data);
    } catch (err) {
      setError("Failed to load units");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createUnit({
        label,
        rentAmount: Number(rentAmount),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
      });
      setLabel("");
      setRentAmount("");
      setBedrooms("");
      setBathrooms("");
      setShowForm(false);
      fetchUnits();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create unit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateUnitStatus(id, newStatus);
      fetchUnits();
    } catch (err) {
      setError("Failed to update status");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="units-page">
      <div className="units-header">
        <h1>Units</h1>
        <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Unit"}
        </button>
      </div>

      {error && <p className="units-error">{error}</p>}

      {showForm && (
        <form className="unit-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Unit label (e.g. Block A - Flat 3)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Rent amount"
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Bedrooms"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            required
            min="0"
          />
          <input
            type="number"
            placeholder="Bathrooms"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            required
            min="0"
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Unit"}
          </button>
        </form>
      )}

      {units.length === 0 ? (
        <p className="units-empty">No units yet. Add your first one above.</p>
      ) : (
        <div className="units-grid">
          {units.map((unit) => (
            <div key={unit.id} className="unit-card">
              <div className="unit-card-header">
                <h3>{unit.label}</h3>
                <span
                  className={`status-badge status-${unit.status.toLowerCase()}`}
                >
                  {unit.status}
                </span>
              </div>
              <p className="unit-rent">
                ₦{Number(unit.rentAmount).toLocaleString()}/year ·{" "}
                {unit.bedrooms} bed · {unit.bathrooms} bath
              </p>

              {unit.leases?.length > 0 && (
                <p className="unit-tenant">
                  Tenant: {unit.leases[0].tenant.name}
                </p>
              )}

              <select
                value={unit.status}
                onChange={(e) => handleStatusChange(unit.id, e.target.value)}
                className="status-select"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Units;
