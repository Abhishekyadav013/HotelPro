
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");

// POST /api/bookings
// Create a booking for the authenticated user.
const createBooking = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, guests } = req.body || {};

    if (
      typeof hotelId !== "string" ||
      !mongoose.isValidObjectId(hotelId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid hotel ID."
      });
    }

    if (
      typeof checkIn !== "string" ||
      typeof checkOut !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(checkIn) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide check-in and check-out dates as YYYY-MM-DD."
      });
    }

    if (!Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({
        success: false,
        message: "Guests must be a positive whole number."
      });
    }

    const start = new Date(`${checkIn}T00:00:00.000Z`);
    const end = new Date(`${checkOut}T00:00:00.000Z`);

    if (
      start.toISOString().slice(0, 10) !== checkIn ||
      end.toISOString().slice(0, 10) !== checkOut
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid calendar dates."
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    if (checkIn < today || end <= start) {
      return res.status(400).json({
        success: false,
        message: "Check-in must not be in the past and check-out must be after check-in."
      });
    }

    const hotel = await Hotel.findOne({
      _id: hotelId,
      isActive: true
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Active hotel not found."
      });
    }

    if (guests > hotel.roomCapacity) {
      return res.status(400).json({
        success: false,
        message: "Guest count exceeds the hotel's configured capacity."
      });
    }

    const nights = (end - start) / (24 * 60 * 60 * 1000);
    const totalPrice = hotel.pricePerNight * nights;

    const booking = await Booking.create({
      user: req.user._id,
      hotel: hotel._id,
      checkIn: start,
      checkOut: end,
      guests,
      totalPrice,
      status: "confirmed"
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking
    });
  } catch (error) {
    console.error("Create booking error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create booking right now."
    });
  }
};

// GET /api/bookings/my
// Retrieve bookings belonging to the authenticated user.
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id
    })
      .populate("hotel", "name location pricePerNight imageUrl")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Get bookings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve bookings right now."
    });
  }
};

module.exports = { createBooking, getMyBookings };
