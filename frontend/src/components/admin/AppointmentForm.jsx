import React, { useState } from "react";
import { createAppointmentAdmin } from "../../services/api";
import { useSalon } from "../../App";

export default function AppointmentForm({ onCreated }) {
  const { services } = useSalon();
  const [form, setForm] = useState({
    client_name: "", client_email: "", client_phone: "",
    service_id: "", appointment_date: "", appointment_time: "", notes: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await createAppointmentAdmin(form);
      setSuccess(true);
      setForm({ client_name: "", client_email: "", client_phone: "", service_id: "", appointment_date: "", appointment_time: "", notes: "" });
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
      <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>Add Appointment</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div className="field">
          <label>Client Name</label>
          <input value={form.client_name} onChange={(e) => set("client_name", e.target.value)} required />
        </div>
        <div className="field">
          <label>Phone</label>
          <input type="tel" value={form.client_phone} onChange={(e) => set("client_phone", e.target.value)} required />
        </div>
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label>Email</label>
          <input type="email" value={form.client_email} onChange={(e) => set("client_email", e.target.value)} required />
        </div>
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label>Service</label>
          <select value={form.service_id} onChange={(e) => set("service_id", e.target.value)} required>
            <option value="">Select a service…</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>)}
          </select>
        </div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={form.appointment_date} onChange={(e) => set("appointment_date", e.target.value)} required />
        </div>
        <div className="field">
          <label>Time</label>
          <input type="time" value={form.appointment_time} onChange={(e) => set("appointment_time", e.target.value)} required />
        </div>
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label>Notes (optional)</label>
          <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">Appointment created!</p>}
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Creating…" : "Create Appointment"}
      </button>
    </form>
  );
}
