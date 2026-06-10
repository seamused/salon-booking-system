import React, { useEffect, useState } from "react";
import { format, parseISO, addDays } from "date-fns";
import { getAvailableDates, getAvailableSlots } from "../../services/api";

function formatTime(time) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function DateTimePicker({ service, value, onChange }) {
  const [availableDates, setAvailableDates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(value?.date || null);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    if (!service) return;
    setLoadingDates(true);
    getAvailableDates(service.id)
      .then((data) => setAvailableDates(data.dates))
      .finally(() => setLoadingDates(false));
  }, [service]);

  useEffect(() => {
    if (!selectedDate || !service) return;
    setLoadingSlots(true);
    setSlots([]);
    getAvailableSlots(selectedDate, service.id)
      .then((data) => setSlots(data.slots))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, service]);

  // Build calendar days for current month view
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calDays = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : new Date(year, month, i - firstDay + 1)
  );

  const handleDateClick = (date) => {
    const str = format(date, "yyyy-MM-dd");
    setSelectedDate(str);
    onChange({ date: str, time: null });
  };

  const handleSlotClick = (slot) => {
    onChange({ date: selectedDate, time: slot.time });
  };

  const prevMonth = () => setCalendarMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(year, month + 1, 1));

  return (
    <div>
      {/* Calendar */}
      <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <button type="button" className="btn btn-ghost" onClick={prevMonth}>‹</button>
          <strong>{format(calendarMonth, "MMMM yyyy")}</strong>
          <button type="button" className="btn btn-ghost" onClick={nextMonth}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", textAlign: "center" }}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
            <div key={d} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#aaa", padding: "0.25rem 0" }}>{d}</div>
          ))}
          {calDays.map((date, i) => {
            if (!date) return <div key={i} />;
            const str = format(date, "yyyy-MM-dd");
            const isAvailable = availableDates.includes(str);
            const isSelected = str === selectedDate;
            const isPast = date < new Date(new Date().setHours(0,0,0,0));
            return (
              <button
                key={str}
                type="button"
                disabled={!isAvailable || isPast || loadingDates}
                onClick={() => handleDateClick(date)}
                style={{
                  padding: "0.5rem 0.25rem",
                  borderRadius: "var(--radius)",
                  border: "none",
                  background: isSelected ? "var(--primary)" : isAvailable ? "var(--accent)" : "transparent",
                  color: isSelected ? "#fff" : !isAvailable ? "#ccc" : "var(--text)",
                  fontWeight: isSelected ? 700 : 400,
                  cursor: isAvailable && !isPast ? "pointer" : "default",
                  fontSize: "0.9rem",
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
        {loadingDates && <p style={{ textAlign: "center", color: "#aaa", fontSize: "0.8rem", marginTop: "0.5rem" }}>Loading availability…</p>}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            Available times for {format(parseISO(selectedDate), "EEEE, MMMM d")}
          </p>
          {loadingSlots ? (
            <p style={{ color: "#aaa", fontSize: "0.9rem" }}>Loading slots…</p>
          ) : slots.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>No available times on this date.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "0.5rem" }}>
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => handleSlotClick(slot)}
                  style={{
                    padding: "0.55rem 0.25rem",
                    borderRadius: "var(--radius)",
                    border: value?.time === slot.time ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                    background: value?.time === slot.time ? "var(--primary)" : "#fff",
                    color: value?.time === slot.time ? "#fff" : "var(--text)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {formatTime(slot.time)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
