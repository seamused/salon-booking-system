const { getAvailableSlots, isDateBlocked, getHoursForDate, getBatchedAvailabilityData } = require("../services/availability");
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

    const today = new Date();
    const windowDays = businessHoursConfig.bookingWindowDays;
    const todayStr = format(today, "yyyy-MM-dd");
    const endDateStr = format(addDays(today, windowDays - 1), "yyyy-MM-dd");

    // Fetch all needed data in 3 parallel queries instead of 2 per day
    const { blockedSet, specificOverrideMap, dowOverrideMap } =
      await getBatchedAvailabilityData(todayStr, endDateStr);

    const availableDates = [];

    for (let i = 0; i < windowDays; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");

      if (blockedSet.has(dateStr)) continue;

      let hours;
      if (specificOverrideMap.has(dateStr)) {
        const ov = specificOverrideMap.get(dateStr);
        hours = { isOpen: ov.is_open, open: ov.open_time?.slice(0, 5), close: ov.close_time?.slice(0, 5) };
      } else {
        const dow = date.getDay();
        const dowOv = dowOverrideMap.get(dow);
        if (dowOv) {
          hours = { isOpen: dowOv.is_open, open: dowOv.open_time?.slice(0, 5), close: dowOv.close_time?.slice(0, 5) };
        } else {
          hours = businessHoursConfig.hours[dow];
        }
      }

      if (!hours || !hours.isOpen) continue;
      availableDates.push(dateStr);
    }

    res.json({ dates: availableDates });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSlots, getAvailableDates };
