const { getAvailableSlots, isDateBlocked, getHoursForDate } = require("../services/availability");
const services = require("../../../config/services");
const businessHoursConfig = require("../../../config/businessHours");
const { addDays, format, parseISO } = require("date-fns");
const branding = require("../../../config/branding");

async function getSlots(req, res, next) {
  try {
    const { date, serviceId } = req.query;
    if (!date || !serviceId) {
      return res.status(400).json({ error: "date and serviceId are required" });
    }

    const service = services.find((s) => s.id === serviceId);
    if (!service) return res.status(404).json({ error: "Service not found" });

    const slots = await getAvailableSlots(date, service.duration);
    res.json({ slots, timezone: branding.timezone });
  } catch (err) {
    next(err);
  }
}

async function getAvailableDates(req, res, next) {
  try {
    const { serviceId } = req.query;
    const service = serviceId ? services.find((s) => s.id === serviceId) : null;
    const duration = service?.duration || 30;

    const today = new Date();
    const windowDays = businessHoursConfig.bookingWindowDays;
    const availableDates = [];

    for (let i = 0; i < windowDays; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const blocked = await isDateBlocked(dateStr);
      if (blocked) continue;

      const hours = await getHoursForDate(dateStr);
      if (!hours || !hours.isOpen) continue;

      availableDates.push(dateStr);
    }

    res.json({ dates: availableDates });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSlots, getAvailableDates };
