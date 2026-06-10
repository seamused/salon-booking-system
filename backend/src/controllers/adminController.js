const supabase = require("../services/supabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const services = require("../../../config/services");
const businessHoursConfig = require("../../../config/businessHours");

// Auth
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data: admin } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    next(err);
  }
}

// Appointments CRUD
async function listAppointments(req, res, next) {
  try {
    const { date, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("appointments")
      .select("*", { count: "exact" })
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })
      .range(offset, offset + limit - 1);

    if (date) query = query.eq("appointment_date", date);
    if (status) query = query.eq("status", status);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ appointments: data, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const allowed = ["status", "notes", "appointment_date", "appointment_time", "client_name", "client_email", "client_phone"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Recalculate end time if date/time/service changes
    if (updates.appointment_time) {
      const { data: existing } = await supabase.from("appointments").select("service_duration").eq("id", id).single();
      if (existing) {
        const [h, m] = updates.appointment_time.split(":").map(Number);
        const total = h * 60 + m + existing.service_duration;
        updates.appointment_end_time = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
      }
    }

    const { data, error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json({ appointment: data });
  } catch (err) {
    next(err);
  }
}

async function createAppointmentAdmin(req, res, next) {
  try {
    const { client_name, client_email, client_phone, service_id, appointment_date, appointment_time, notes } = req.body;
    const service = services.find((s) => s.id === service_id);
    if (!service) return res.status(404).json({ error: "Service not found" });

    const [h, m] = appointment_time.split(":").map(Number);
    const total = h * 60 + m + service.duration;
    const endTime = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        client_name, client_email, client_phone,
        service_id, service_name: service.name,
        service_duration: service.duration, service_price: service.price,
        appointment_date, appointment_time,
        appointment_end_time: endTime,
        timezone: require("../../../config/branding").timezone,
        notes, status: "confirmed",
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ appointment: data });
  } catch (err) {
    next(err);
  }
}

async function deleteAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// Blocked dates
async function listBlockedDates(req, res, next) {
  try {
    const { data, error } = await supabase.from("blocked_dates").select("*").order("date");
    if (error) throw error;
    res.json({ blockedDates: data });
  } catch (err) {
    next(err);
  }
}

async function addBlockedDate(req, res, next) {
  try {
    const { date, reason } = req.body;
    const { data, error } = await supabase.from("blocked_dates").insert({ date, reason }).select().single();
    if (error) throw error;
    res.status(201).json({ blockedDate: data });
  } catch (err) {
    next(err);
  }
}

async function removeBlockedDate(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// Business hours overrides
async function getHoursOverrides(req, res, next) {
  try {
    const { data, error } = await supabase.from("business_hours_overrides").select("*").order("day_of_week");
    if (error) throw error;
    res.json({ overrides: data, defaults: businessHoursConfig });
  } catch (err) {
    next(err);
  }
}

async function upsertHoursOverride(req, res, next) {
  try {
    const { day_of_week, specific_date, is_open, open_time, close_time } = req.body;
    const { data, error } = await supabase
      .from("business_hours_overrides")
      .upsert({ day_of_week, specific_date, is_open, open_time, close_time }, { onConflict: "day_of_week" })
      .select()
      .single();
    if (error) throw error;
    res.json({ override: data });
  } catch (err) {
    next(err);
  }
}

async function deleteHoursOverride(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("business_hours_overrides").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  listAppointments, updateAppointment, createAppointmentAdmin, deleteAppointment,
  listBlockedDates, addBlockedDate, removeBlockedDate,
  getHoursOverrides, upsertHoursOverride, deleteHoursOverride,
};
