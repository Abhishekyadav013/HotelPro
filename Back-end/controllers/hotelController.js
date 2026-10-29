
const Hotel = require("../models/Hotel");

// @desc    Get all active hotels
// @route   GET /api/hotels
// @access  Public
const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: hotels.length,
      hotels
    });
  } catch (error) {
    console.error("Get hotels error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve hotels right now."
    });
  }
};

// @desc    Create a hotel
// @route   POST /api/hotels
// @access  Admin only
const createHotel = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      pricePerNight,
      amenities,
      roomCapacity,
      imageUrl
    } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      !location ||
      typeof location !== "object" ||
      Array.isArray(location) ||
      typeof location.city !== "string" ||
      typeof location.country !== "string" ||
      typeof location.address !== "string" ||
      typeof pricePerNight !== "number" ||
      !Number.isFinite(pricePerNight) ||
      typeof roomCapacity !== "number" ||
      !Number.isInteger(roomCapacity) ||
      !Array.isArray(amenities) ||
      !amenities.every(item => typeof item === "string") ||
      (imageUrl !== undefined && typeof imageUrl !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid hotel details."
      });
    }

    const hotel = await Hotel.create({
      name,
      description,
      location,
      pricePerNight,
      amenities,
      roomCapacity,
      imageUrl
    });

    return res.status(201).json({
      success: true,
      message: "Hotel created successfully.",
      hotel
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel data.",
        errors: error.name === "ValidationError"
          ? Object.values(error.errors).map(item => item.message)
          : undefined
      });
    }

    console.error("Create hotel error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create hotel right now."
    });
  }
};

// @desc    Get a single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      isActive: true
    }).lean();

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found."
      });
    }

    return res.status(200).json({
      success: true,
      hotel
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID."
      });
    }

    console.error("Get hotel by ID error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve hotel right now."
    });
  }
};

module.exports = { getHotels, getHotelById, createHotel };
