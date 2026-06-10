import React, { useState, useEffect } from "react";
import AdminLogin from "../components/admin/AdminLogin";
import AdminDashboard from "../components/admin/AdminDashboard";

function parseToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;
    const payload = parseToken(token);
    if (payload && payload.exp * 1000 > Date.now()) {
      setAdmin({ id: payload.id, email: payload.email, name: payload.name });
    } else {
      localStorage.removeItem("adminToken");
    }
  }, []);

  if (!admin) return <AdminLogin onLogin={setAdmin} />;
  return <AdminDashboard admin={admin} onLogout={() => setAdmin(null)} />;
}
