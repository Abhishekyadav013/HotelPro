
const express = require("express");
const {
  getHotels,
  getHotelById,
  createHotel
} = require("../controllers/hotelController");
const {
  protect,
  authorizeRoles
} = require("../middelware/authMiddleware");

const router = express.Router();

// Public: anyone can browse active hotels
router.get("/", getHotels);
router.get("/:id", getHotelById);

// Protected: only admins can create hotels
router.post("/", protect, authorizeRoles("admin"), createHotel);

module.exports = router;
