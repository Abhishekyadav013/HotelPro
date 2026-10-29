const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const app = express();
const hotelRoutes = require("./routes/hotelRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json());
app.use("/api/hotels", hotelRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to HotelPro API",
        status: "running"
    });
});

const PORT = process.env.PORT || 5000;
const RETRY_DELAY_MS = 15000;

async function startServer() {
    app.listen(PORT, () => {
        console.log(`HotelPro server running on port ${PORT}`);
    });

    while (mongoose.connection.readyState !== 1) {
        try {
            await connectDB();
        } catch (error) {
            console.error(
                `HotelPro database is unavailable; retrying in ${RETRY_DELAY_MS / 1000} seconds.`,
            );
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }
}

startServer();
