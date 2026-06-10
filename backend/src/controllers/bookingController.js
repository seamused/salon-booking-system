const supabase = require("../services/supabase");
const { getAvailableSlots } = require("../services/availability");
const { sendClientConfirmation, sendOwnerNotification, sendCancellationConfirmation } = require("../services/twilio");
const services = require("../../../config/services");
const businessHoursConfig = require("../../../config/businessHours");
const branding = require("../../../config/branding");

function addMinutesToTime(time, minutes) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

async function createBooking(req, res, next) {
  try {
    const { client_name, client_email, client_phone, service_id, appointment_date, appointment_time, notes } = req.body;

    if (!client_name || !client_email || !client_phone || !service_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const service = services.find((s) => s.id === service_id);
    if (!service) return res.status(404).json({ error: "Service not found" });

    // Validate phone format
    const phoneClean = client_phone.replace(/\D/g, "");
    if (phoneClean.length < 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Double-booking prevention: re-check availability at write time
    const availableSlots = await getAvailableSlots(appointment_date, service.duration);
    const slotExists = availableSlots.some((s) => s.time === appointment_time);
    if (!slotExists) {
      return res.status(409).json({ error: "This time slot is no longer available" });
    }

    const endTime = addMinutesToTime(appointment_time, service.duration);

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        client_name,
        client_email,
        client_phone: `+1${phoneClean.slice(-10)}`,
        service_id,
        service_name: service.name,
        service_duration: service.duration,
        service_price: service.price,
        appointment_date,
        appointment_time,
        appointment_end_time: endTime,
        timezone: branding.timezone,
        notes: notes || null,
        status: "confirmed",
      })
      .select()
      .single();

    if (error) throw error;

    // Fire SMS non-blocking
    Promise.all([
      sendClientConfirmation(data).catch(console.error),
      sendOwnerNotification(data).catch(console.error),
    ]);

    res.status(201).json({ appointment: data });
  } catch (err) {
    next(err);
  }
}

async function getBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return res.status(404).json({ error: "Appointment not found" });
    res.json({ appointment: data });
  } catch (err) {
    next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) return res.status(404).json({ error: "Appointment not found" });
    if (existing.status === "cancelled") {
      return res.status(400).json({ error: "Appointment is already cancelled" });
    }

    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    sendCancellationConfirmation(data).catch(console.error);

    res.json({ appointment: data });
  } catch (err) {
    next(err);
  }
}

module.exports = { createBooking, getBooking, cancelBooking };
