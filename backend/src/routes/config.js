const { Router } = require("express");
const branding = require("../../../config/branding");
const services = require("../../../config/services");
const businessHours = require("../../../config/businessHours");

const router = Router();

// Public config endpoint — frontend reads this to know salon details, services, hours
router.get("/", (req, res) => {
  res.json({
    branding: {
      salonName: branding.salonName,
      tagline: branding.tagline,
      phone: branding.phone,
      email: branding.email,
      address: branding.address,
      website: branding.website,
      timezone: branding.timezone,
      colors: branding.colors,
      logo: branding.logo,
    },
    services,
    businessHours: {
      bufferTime: businessHours.bufferTime,
      slotInterval: businessHours.slotInterval,
      bookingWindowDays: businessHours.bookingWindowDays,
      minNoticeHours: businessHours.minNoticeHours,
      hours: businessHours.hours,
    },
  });
});

module.exports = router;
