import React from "react";

export default function LoadingSpinner({ message }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <div className="spinner" />
      {message && <p style={{ color: "#888", marginTop: "0.5rem" }}>{message}</p>}
    </div>
  );
}
