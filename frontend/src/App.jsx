import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getConfig } from "./services/api";
import { defaultConfig } from "./config";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import AdminPage from "./pages/AdminPage";

export const SalonContext = createContext(defaultConfig);
export const useSalon = () => useContext(SalonContext);

export default function App() {
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    getConfig().then(setConfig).catch(console.error);
  }, []);

  // Apply branding CSS variables
  useEffect(() => {
    if (!config.branding?.colors) return;
    const root = document.documentElement;
    const c = config.branding.colors;
    if (c.primary) root.style.setProperty("--primary", c.primary);
    if (c.secondary) root.style.setProperty("--secondary", c.secondary);
    if (c.accent) root.style.setProperty("--accent", c.accent);
    if (c.text) root.style.setProperty("--text", c.text);
    document.title = config.branding.salonName || "Salon Booking";
  }, [config]);

  return (
    <SalonContext.Provider value={config}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/confirmation/:id" element={<ConfirmationPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </SalonContext.Provider>
  );
}
