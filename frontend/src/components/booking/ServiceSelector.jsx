import React from "react";
import { useSalon } from "../../App";

export default function ServiceSelector({ value, onChange }) {
  const { services } = useSalon();

  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888", marginBottom: "0.5rem" }}>
            {cat}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {services.filter((s) => s.category === cat).map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => onChange(service)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius)",
                  border: value?.id === service.id ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                  background: value?.id === service.id ? "var(--accent)" : "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{service.name}</p>
                  <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.15rem" }}>
                    {service.duration} min{service.description ? ` · ${service.description}` : ""}
                  </p>
                </div>
                <span style={{ fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap", marginLeft: "1rem" }}>
                  ${service.price}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
