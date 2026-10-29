
const express = require("express");
const {
	registerUser,
	loginUser,
	getMe,
	getAdminTest,
} = require("../controllers/authController");
const {
	protect,
	authorizeRoles,
} = require("../middelware/authMiddleware");

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/me
router.get("/me", protect, getMe);

// GET /api/auth/admin-test
router.get("/admin-test", protect, authorizeRoles("admin"), getAdminTest);

module.exports = router;