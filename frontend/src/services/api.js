import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Attach JWT for admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Public
export const getConfig = () => api.get("/config").then((r) => r.data);
export const getAvailableDates = (serviceId) => api.get("/availability/dates", { params: { serviceId } }).then((r) => r.data);
export const getAvailableSlots = (date, serviceId) => api.get("/availability/slots", { params: { date, serviceId } }).then((r) => r.data);
export const createBooking = (data) => api.post("/bookings", data).then((r) => r.data);
export const getBooking = (id) => api.get(`/bookings/${id}`).then((r) => r.data);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`).then((r) => r.data);

// Admin
export const adminLogin = (email, password) => api.post("/admin/login", { email, password }).then((r) => r.data);
export const getAppointments = (params) => api.get("/admin/appointments", { params }).then((r) => r.data);
export const createAppointmentAdmin = (data) => api.post("/admin/appointments", data).then((r) => r.data);
export const updateAppointment = (id, data) => api.patch(`/admin/appointments/${id}`, data).then((r) => r.data);
export const deleteAppointment = (id) => api.delete(`/admin/appointments/${id}`).then((r) => r.data);
export const getBlockedDates = () => api.get("/admin/blocked-dates").then((r) => r.data);
export const addBlockedDate = (data) => api.post("/admin/blocked-dates", data).then((r) => r.data);
export const removeBlockedDate = (id) => api.delete(`/admin/blocked-dates/${id}`).then((r) => r.data);
export const getBusinessHours = () => api.get("/admin/business-hours").then((r) => r.data);
export const upsertBusinessHours = (data) => api.post("/admin/business-hours", data).then((r) => r.data);
export const deleteBusinessHoursOverride = (id) => api.delete(`/admin/business-hours/${id}`).then((r) => r.data);
