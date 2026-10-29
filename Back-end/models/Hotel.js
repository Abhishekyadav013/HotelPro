
const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hotel name is required."],
      trim: true,
      minlength: 2,
      maxlength: 120
    },

    description: {
      type: String,
      required: [true, "Hotel description is required."],
      trim: true,
      minlength: 20,
      maxlength: 2000
    },

    location: {
      city: {
        type: String,
        required: [true, "City is required."],
        trim: true
      },
      state: {
        type: String,
        trim: true,
        default: ""
      },
      country: {
        type: String,
        required: [true, "Country is required."],
        trim: true
      },
      address: {
        type: String,
        required: [true, "Hotel address is required."],
        trim: true
      }
    },

    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required."],
      min: 0
    },

    amenities: {
      type: [String],
      default: []
    },

    roomCapacity: {
      type: Number,
      required: [true, "Room capacity is required."],
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Room capacity must be a whole number."
      }
    },

    imageUrl: {
      type: String,
      trim: true,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Hotel", hotelSchema);
