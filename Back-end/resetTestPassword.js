require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function resetTestPassword() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the environment.");
    }

    if (!process.env.TEST_USER_PASSWORD) {
      throw new Error("TEST_USER_PASSWORD is missing from the environment.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({
      email: "hotelpro.test@example.com",
    }).select("+password");

    if (!user) {
      console.log("Test user not found.");
      return;
    }

    user.password = process.env.TEST_USER_PASSWORD;
    await user.save();

    console.log("Test password reset successfully.");
  } catch (error) {
    console.error("Password reset failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

resetTestPassword();