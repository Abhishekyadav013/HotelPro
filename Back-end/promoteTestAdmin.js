
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function promoteTestAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the environment.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const email = "hotelpro.test@example.com";

    const user = await User.findOne({ email });

    if (!user) {
      console.log("Test account not found. No changes made.");
      return;
    }

    user.role = "admin";
    await user.save();

    console.log("Test account promoted successfully.");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

promoteTestAdmin();
