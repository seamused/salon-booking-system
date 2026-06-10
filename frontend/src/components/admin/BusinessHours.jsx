import React, { useEffect, useState } from "react";
import { getBusinessHours, upsertBusinessHours, deleteBusinessHoursOverride } from "../../services/api";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export default function BusinessHours() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(null);

  async function load() {
    const result = await getBusinessHours();
    setData(result);
  }

  useEffect(() => { load(); }, []);

  function getOverrideForDay(dow) {
    return data?.overrides?.find((o) => o.day_of_week === dow && !o.specific_date);
  }

  function getEffectiveHours(dow) {
    const override = getOverrideForDay(dow);
    if (override) return { isOpen: override.is_open, open: override.open_time?.slice(0,5), close: override.close_time?.slice(0,5), isOverride: true, id: override.id };
    const def = data?.defaults?.hours?.[dow];
    return def ? { ...def, isOverride: false } : { isOpen: false, isOverride: false };
  }

  async function handleToggleOpen(dow, currentlyOpen) {
    setSaving(dow);
    const hours = getEffectiveHours(dow);
    await upsertBusinessHours({
      day_of_week: dow,
      is_open: !currentlyOpen,
      open_time: hours.open || "09:00",
      close_time: hours.close || "17:00",
    });
    await load();
    setSaving(null);
  }

  async function handleTimeChange(dow, field, value) {
    const hours = getEffectiveHours(dow);
    await upsertBusinessHours({
      day_of_week: dow,
      is_open: hours.isOpen,
      open_time: field === "open" ? value : hours.open,
      close_time: field === "close" ? value : hours.close,
    });
    await load();
  }

  async function handleReset(id) {
    await deleteBusinessHoursOverride(id);
    load();
  }

  if (!data) return <div className="spinner" />;

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>Business Hours</h2>
        <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.25rem" }}>
          Overrides take precedence over the config file. Click "Reset" to revert to config defaults.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {DAYS.map((dayName, dow) => {
            const h = getEffectiveHours(dow);
            return (
              <div key={dow} style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ width: 90, fontWeight: 600, fontSize: "0.9rem" }}>{dayName}</span>
                <button
                  className={`btn ${h.isOpen ? "btn-primary" : "btn-outline"}`}
                  style={{ padding: "0.3rem 0.7rem", fontSize: "0.82rem", minWidth: 60 }}
                  onClick={() => handleToggleOpen(dow, h.isOpen)}
                  disabled={saving === dow}
                >
                  {h.isOpen ? "Open" : "Closed"}
                </button>
                {h.isOpen && (
                  <>
                    <input type="time" defaultValue={h.open} onBlur={(e) => handleTimeChange(dow, "open", e.target.value)} style={{ width: 120 }} />
                    <span style={{ color: "#888" }}>–</span>
                    <input type="time" defaultValue={h.close} onBlur={(e) => handleTimeChange(dow, "close", e.target.value)} style={{ width: 120 }} />
                  </>
                )}
                {h.isOverride && (
                  <button className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "0.25rem 0.5rem", color: "#e67e22" }} onClick={() => handleReset(h.id)}>
                    Reset
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
