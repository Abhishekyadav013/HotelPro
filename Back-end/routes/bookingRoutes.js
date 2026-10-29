
const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings
} = require("../controllers/bookingController");

const { protect } = require("../middelware/authMiddleware");

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);

module.exports = router;
