const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateProfile, changePassword, getAllUsers, getAllTours } = require("../controllers/authcontroller");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

// Admin routes
router.get("/admin/users", verifyToken, verifyAdmin, getAllUsers);
router.get("/admin/tours", verifyToken, verifyAdmin, getAllTours);

module.exports = router;