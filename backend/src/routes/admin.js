const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  login,
  listAppointments, updateAppointment, createAppointmentAdmin, deleteAppointment,
  listBlockedDates, addBlockedDate, removeBlockedDate,
  getHoursOverrides, upsertHoursOverride, deleteHoursOverride,
} = require("../controllers/adminController");

const router = Router();

router.post("/login", login);

// All routes below require auth
router.use(requireAuth);

router.get("/appointments", listAppointments);
router.post("/appointments", createAppointmentAdmin);
router.patch("/appointments/:id", updateAppointment);
router.delete("/appointments/:id", deleteAppointment);

router.get("/blocked-dates", listBlockedDates);
router.post("/blocked-dates", addBlockedDate);
router.delete("/blocked-dates/:id", removeBlockedDate);

router.get("/business-hours", getHoursOverrides);
router.post("/business-hours", upsertHoursOverride);
router.delete("/business-hours/:id", deleteHoursOverride);

module.exports = router;
