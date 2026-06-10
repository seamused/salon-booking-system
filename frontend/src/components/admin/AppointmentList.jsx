import React, { useEffect, useState } from "react";
import { getAppointments, updateAppointment, deleteAppointment } from "../../services/api";

const STATUS_OPTIONS = ["confirmed", "completed", "cancelled", "no_show"];

function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ date: "", status: "", page: 1 });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;
      params.page = filters.page;
      const data = await getAppointments(params);
      setAppointments(data.appointments);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filters]);

  async function handleStatusChange(id, status) {
    await updateAppointment(id, { status });
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Permanently delete this appointment?")) return;
    await deleteAppointment(id);
    load();
  }

  async function handleSaveEdit(id, updates) {
    await updateAppointment(id, updates);
    setEditing(null);
    load();
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value, page: 1 })}
          style={{ width: 180 }}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          style={{ width: 160 }}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filters.date || filters.status) && (
          <button className="btn btn-ghost" onClick={() => setFilters({ date: "", status: "", page: 1 })}>
            Clear filters
          </button>
        )}
      </div>

      <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.75rem" }}>{total} appointment{total !== 1 ? "s" : ""}</p>

      {loading ? (
        <div className="spinner" />
      ) : appointments.length === 0 ? (
        <p style={{ color: "#aaa", textAlign: "center", padding: "2rem 0" }}>No appointments found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {appointments.map((appt) => (
            <div key={appt.id} className="card" style={{ padding: "1rem" }}>
              {editing === appt.id ? (
                <EditRow appt={appt} onSave={(u) => handleSaveEdit(appt.id, u)} onCancel={() => setEditing(null)} />
              ) : (
                <ViewRow appt={appt} onEdit={() => setEditing(appt.id)} onStatusChange={handleStatusChange} onDelete={handleDelete} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 50 && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", justifyContent: "center" }}>
          <button className="btn btn-outline" disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Previous</button>
          <span style={{ alignSelf: "center", fontSize: "0.9rem" }}>Page {filters.page}</span>
          <button className="btn btn-outline" disabled={appointments.length < 50} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
        </div>
      )}
    </div>
  );
}

function ViewRow({ appt, onEdit, onStatusChange, onDelete }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
      <div>
        <div style={{ fontWeight: 600 }}>{appt.client_name}</div>
        <div style={{ fontSize: "0.85rem", color: "#888" }}>{appt.client_phone} · {appt.client_email}</div>
        <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
          {appt.appointment_date} at {formatTime(appt.appointment_time)} · {appt.service_name}
        </div>
        {appt.notes && <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.2rem" }}>Note: {appt.notes}</div>}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <span className={`badge badge-${appt.status}`}>{appt.status}</span>
        <select
          value={appt.status}
          onChange={(e) => onStatusChange(appt.id, e.target.value)}
          style={{ width: 130, fontSize: "0.82rem", padding: "0.3rem 0.5rem" }}
        >
          {["confirmed","completed","cancelled","no_show"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-outline" style={{ padding: "0.3rem 0.7rem", fontSize: "0.82rem" }} onClick={onEdit}>Edit</button>
        <button className="btn btn-danger" style={{ padding: "0.3rem 0.7rem", fontSize: "0.82rem" }} onClick={() => onDelete(appt.id)}>Delete</button>
      </div>
    </div>
  );
}

function EditRow({ appt, onSave, onCancel }) {
  const [notes, setNotes] = useState(appt.notes || "");
  const [date, setDate] = useState(appt.appointment_date);
  const [time, setTime] = useState(appt.appointment_time.slice(0, 5));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p style={{ fontWeight: 600 }}>Editing: {appt.client_name} — {appt.service_name}</p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label>Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <div>
        <label>Notes</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button className="btn btn-primary" onClick={() => onSave({ notes, appointment_date: date, appointment_time: time })}>Save</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
