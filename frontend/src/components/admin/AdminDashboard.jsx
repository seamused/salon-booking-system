import React, { useState } from "react";
import AppointmentList from "./AppointmentList";
import AppointmentForm from "./AppointmentForm";
import BlockedDates from "./BlockedDates";
import BusinessHours from "./BusinessHours";
import { useSalon } from "../../App";

const TABS = [
  { id: "appointments", label: "Appointments" },
  { id: "add", label: "Add Booking" },
  { id: "blocked", label: "Blocked Dates" },
  { id: "hours", label: "Business Hours" },
];

export default function AdminDashboard({ admin, onLogout }) {
  const [tab, setTab] = useState("appointments");
  const { branding } = useSalon();

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf9" }}>
      {/* Header */}
      <div style={{ background: "var(--secondary)", color: "#fff", padding: "0.75rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{branding?.salonName}</span>
          <span style={{ marginLeft: "0.75rem", fontSize: "0.85rem", opacity: 0.7 }}>Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>{admin.name}</span>
          <button
            className="btn btn-ghost"
            style={{ color: "#fff", fontSize: "0.82rem", padding: "0.3rem 0.6rem" }}
            onClick={() => { localStorage.removeItem("adminToken"); onLogout(); }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "0 1.5rem", display: "flex", gap: "0.25rem" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className="btn btn-ghost"
            onClick={() => setTab(t.id)}
            style={{
              padding: "0.85rem 1rem",
              fontWeight: tab === t.id ? 700 : 400,
              borderBottom: tab === t.id ? "2.5px solid var(--primary)" : "2.5px solid transparent",
              borderRadius: 0,
              color: tab === t.id ? "var(--primary)" : "var(--text)",
              fontSize: "0.9rem",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
        {tab === "appointments" && <AppointmentList />}
        {tab === "add" && <AppointmentForm onCreated={() => setTab("appointments")} />}
        {tab === "blocked" && <BlockedDates />}
        {tab === "hours" && <BusinessHours />}
      </div>
    </div>
  );
}
