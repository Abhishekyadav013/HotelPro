
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// POST /api/auth/register
async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body || {};

    // 1. Validate required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 2 and 80 characters.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must contain between 8 and 72 characters.",
      });
    }

    // 2. Check whether the email is already registered
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 3. Create a guest account.
    // Never accept a public user's requested role.
    const user = new User({
      name: cleanName,
      email: cleanEmail,
      password,
      role: "guest",
    });

    // The User model's pre-save hook hashes the password.
    await user.save();

    // 4. Return only safe fields
    return res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // A unique index protects against simultaneous duplicate requests.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Registration data is invalid.",
      });
    }

    // Log the error on the server, not sensitive details to the client.
    console.error("Registration failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to register right now. Please try again later.",
    });
  }
}

// Login User Code

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // The password field has select: false in your User model.
    const user = await User.findOne({ email: cleanEmail })
      .select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("Login configuration error: JWT_SECRET is missing.");

      return res.status(500).json({
        success: false,
        message: "Login is temporarily unavailable."
      });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in right now. Please try again later."
    });
  }
};

// getme. controller function
const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive
    }
  });
};

const getAdminTest = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin access granted.",
    user: {
      id: req.user._id.toString(),
      role: req.user.role
    }
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getAdminTest,
};