import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../services/api";
import ServiceSelector from "./ServiceSelector";
import DateTimePicker from "./DateTimePicker";
import { useSalon } from "../../App";

const STEPS = ["Service", "Date & Time", "Your Details", "Confirm"];

export default function BookingForm() {
  const { branding } = useSalon();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [service, setService] = useState(null);
  const [datetime, setDatetime] = useState({ date: null, time: null });
  const [client, setClient] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function formatTime(time) {
    const [h, m] = time.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  }

  const canNext = [
    !!service,
    !!(datetime.date && datetime.time),
    !!(client.name && client.email && client.phone),
    true,
  ][step];

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const { appointment } = await createBooking({
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone,
        service_id: service.id,
        appointment_date: datetime.date,
        appointment_time: datetime.time,
        notes: client.notes || undefined,
      });
      navigate(`/confirmation/${appointment.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        {branding?.salonName}
      </h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>{branding?.tagline}</p>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= step ? "var(--primary)" : "var(--border)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: "1rem" }}>
        Step {step + 1} of {STEPS.length} — <strong style={{ color: "var(--text)" }}>{STEPS[step]}</strong>
      </p>

      {/* Step 0 — Service */}
      {step === 0 && (
        <ServiceSelector value={service} onChange={(s) => { setService(s); setDatetime({ date: null, time: null }); }} />
      )}

      {/* Step 1 — Date & Time */}
      {step === 1 && (
        <DateTimePicker service={service} value={datetime} onChange={setDatetime} />
      )}

      {/* Step 2 — Client details */}
      {step === 2 && (
        <div className="card">
          <div className="field">
            <label>Full Name</label>
            <input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Jane Smith" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} placeholder="jane@example.com" />
          </div>
          <div className="field">
            <label>Phone (for SMS confirmation)</label>
            <input type="tel" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} placeholder="(555) 555-5555" />
          </div>
          <div className="field">
            <label>Notes (optional)</label>
            <textarea rows={3} value={client.notes} onChange={(e) => setClient({ ...client, notes: e.target.value })} placeholder="Any requests or special instructions…" />
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>Review your booking</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.95rem" }}>
            <Row label="Service" value={`${service.name} · ${service.duration} min · $${service.price}`} />
            <Row label="Date" value={new Date(datetime.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
            <Row label="Time" value={formatTime(datetime.time)} />
            <Row label="Name" value={client.name} />
            <Row label="Email" value={client.email} />
            <Row label="Phone" value={client.phone} />
            {client.notes && <Row label="Notes" value={client.notes} />}
          </div>
          <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "1rem" }}>
            A confirmation SMS will be sent to {client.phone}.
          </p>
          {error && <p className="error-msg" style={{ marginTop: "0.75rem" }}>{error}</p>}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
        {step > 0 ? (
          <button className="btn btn-outline" onClick={() => setStep(step - 1)}>Back</button>
        ) : <div />}
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Continue
          </button>
        ) : (
          <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Booking…" : "Confirm Booking"}
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <span style={{ color: "#888", minWidth: 70 }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
