const { addMinutes, format, parse, isAfter, isBefore, parseISO } = require("date-fns");
const { toZonedTime, fromZonedTime } = require("date-fns-tz");
const supabase = require("./supabase");
const businessHoursConfig = require("../../../config/businessHours");
const branding = require("../../../config/branding");

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

async function getHoursForDate(dateStr) {
  const date = parseISO(dateStr);
  const dayOfWeek = date.getDay();

  // Check for specific date override first
  const { data: override } = await supabase
    .from("business_hours_overrides")
    .select("*")
    .eq("specific_date", dateStr)
    .maybeSingle();

  if (override) {
    return {
      isOpen: override.is_open,
      open: override.open_time?.slice(0, 5),
      close: override.close_time?.slice(0, 5),
    };
  }

  // Check day-of-week override
  const { data: dowOverride } = await supabase
    .from("business_hours_overrides")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .is("specific_date", null)
    .maybeSingle();

  if (dowOverride) {
    return {
      isOpen: dowOverride.is_open,
      open: dowOverride.open_time?.slice(0, 5),
      close: dowOverride.close_time?.slice(0, 5),
    };
  }

  return businessHoursConfig.hours[dayOfWeek];
}

async function isDateBlocked(dateStr) {
  const { data } = await supabase
    .from("blocked_dates")
    .select("id")
    .eq("date", dateStr)
    .maybeSingle();
  return !!data;
}

async function getAvailableSlots(dateStr, serviceDuration) {
  const timezone = branding.timezone;
  const { bufferTime, slotInterval, minNoticeHours } = businessHoursConfig;

  if (await isDateBlocked(dateStr)) return [];

  const hours = await getHoursForDate(dateStr);
  if (!hours || !hours.isOpen) return [];

  const openMinutes = timeToMinutes(hours.open);
  const closeMinutes = timeToMinutes(hours.close);
  const requiredMinutes = serviceDuration + bufferTime;

  // Fetch existing appointments for this date
  const { data: existing } = await supabase
    .from("appointments")
    .select("appointment_time, appointment_end_time, service_duration")
    .eq("appointment_date", dateStr)
    .neq("status", "cancelled");

  const now = toZonedTime(new Date(), timezone);
  const minBookingTime = addMinutes(now, minNoticeHours * 60);

  const slots = [];

  for (
    let start = openMinutes;
    start + requiredMinutes <= closeMinutes;
    start += slotInterval
  ) {
    const end = start + serviceDuration;
    const endWithBuffer = end + bufferTime;

    const slotStartTime = minutesToTime(start);
    const slotEndTime = minutesToTime(end);

    // Check if slot is in the past (with min notice)
    const slotDateTime = parse(
      `${dateStr} ${slotStartTime}`,
      "yyyy-MM-dd HH:mm",
      new Date()
    );
    const slotInZone = fromZonedTime(slotDateTime, timezone);
    if (isBefore(slotInZone, minBookingTime)) continue;

    // Check for conflicts with existing appointments
    const hasConflict = (existing || []).some((appt) => {
      const apptStart = timeToMinutes(appt.appointment_time.slice(0, 5));
      const apptEnd = timeToMinutes(appt.appointment_end_time.slice(0, 5)) + bufferTime;
      return start < apptEnd && endWithBuffer > apptStart;
    });

    if (!hasConflict) {
      slots.push({ time: slotStartTime, endTime: slotEndTime });
    }
  }

  return slots;
}

async function getBatchedAvailabilityData(todayStr, endDateStr) {
  const [{ data: blockedRows }, { data: specificOverrides }, { data: dowOverrides }] =
    await Promise.all([
      supabase.from("blocked_dates").select("date").gte("date", todayStr).lte("date", endDateStr),
      supabase
        .from("business_hours_overrides")
        .select("*")
        .gte("specific_date", todayStr)
        .lte("specific_date", endDateStr)
        .not("specific_date", "is", null),
      supabase.from("business_hours_overrides").select("*").is("specific_date", null),
    ]);
  return {
    blockedSet: new Set((blockedRows || []).map((r) => r.date)),
    specificOverrideMap: new Map((specificOverrides || []).map((r) => [r.specific_date, r])),
    dowOverrideMap: new Map((dowOverrides || []).map((r) => [r.day_of_week, r])),
  };
}

module.exports = { getAvailableSlots, isDateBlocked, getHoursForDate, getBatchedAvailabilityData };
