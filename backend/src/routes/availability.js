const { Router } = require("express");
const { getSlots, getAvailableDates } = require("../controllers/availabilityController");

const router = Router();

router.get("/slots", getSlots);
router.get("/dates", getAvailableDates);

module.exports = router;
