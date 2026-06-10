import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBooking } from "../services/api";
import { useSalon } from "../App";

function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export default function ConfirmationPage() {
  const { id } = useParams();
  const { branding } = useSalon();
  const [appt, setAppt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBooking(id).then((d) => setAppt(d.appointment)).catch(() => setError("Appointment not found."));
  }, [id]);

  if (error) return <div style={{ maxWidth: 500, margin: "4rem auto", textAlign: "center" }}><p>{error}</p><Link to="/">Book again</Link></div>;
  if (!appt) return <div style={{ maxWidth: 500, margin: "4rem auto", textAlign: "center" }}><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: "1.5rem 1rem", textAlign: "center" }}>
      <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>✓</div>
      <h1 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>You're booked!</h1>
      <p style={{ color: "#888", marginBottom: "1.5rem" }}>A confirmation has been sent to {appt.client_phone}.</p>

      <div className="card" style={{ textAlign: "left" }}>
        <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>{branding?.salonName}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <Row label="Service" value={appt.service_name} />
          <Row label="Date" value={new Date(appt.appointment_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
          <Row label="Time" value={formatTime(appt.appointment_time)} />
          <Row label="Duration" value={`${appt.service_duration} min`} />
          {appt.service_price && <Row label="Price" value={`$${appt.service_price}`} />}
        </div>
      </div>

      {branding?.address && (
        <p style={{ marginTop: "1rem", color: "#888", fontSize: "0.9rem" }}>{branding.address}</p>
      )}
      {branding?.phone && (
        <p style={{ color: "#888", fontSize: "0.9rem" }}>Questions? Call <a href={`tel:${branding.phone}`}>{branding.phone}</a></p>
      )}

      <Link to="/" className="btn btn-outline" style={{ display: "inline-flex", marginTop: "1.5rem" }}>
        Book another appointment
      </Link>
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
