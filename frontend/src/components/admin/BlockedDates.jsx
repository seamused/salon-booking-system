import React, { useEffect, useState } from "react";
import { getBlockedDates, addBlockedDate, removeBlockedDate } from "../../services/api";

export default function BlockedDates() {
  const [dates, setDates] = useState([]);
  const [form, setForm] = useState({ date: "", reason: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await getBlockedDates();
    setDates(data.blockedDates);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await addBlockedDate(form);
      setForm({ date: "", reason: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add date");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id) {
    await removeBlockedDate(id);
    load();
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <form className="card" onSubmit={handleAdd} style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>Block a Date</h2>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 160 }}>
            <label>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="field" style={{ flex: 2, minWidth: 200 }}>
            <label>Reason (optional)</label>
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Holiday, Staff training" />
          </div>
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Blocking…" : "Block Date"}
        </button>
      </form>

      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>Blocked Dates</h2>
        {dates.length === 0 ? (
          <p style={{ color: "#aaa" }}>No dates currently blocked.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {dates.map((d) => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{d.date}</span>
                  {d.reason && <span style={{ marginLeft: "0.75rem", color: "#888", fontSize: "0.9rem" }}>{d.reason}</span>}
                </div>
                <button className="btn btn-danger" style={{ padding: "0.25rem 0.65rem", fontSize: "0.82rem" }} onClick={() => handleRemove(d.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
