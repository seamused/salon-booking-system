const { Router } = require("express");
const { createBooking, getBooking, cancelBooking } = require("../controllers/bookingController");

const router = Router();

router.post("/", createBooking);
router.get("/:id", getBooking);
router.patch("/:id/cancel", cancelBooking);

module.exports = router;
