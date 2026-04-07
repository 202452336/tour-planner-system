const express = require("express");
const router = express.Router();

const {
    getAllHotels,
    getHotelById,
    getHotelsByDestination,
    addHotel,
    updateHotel,
    deleteHotel
} = require("../controllers/hotelController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllHotels);
router.get("/destination/:destinationId", getHotelsByDestination);
router.get("/:id", getHotelById);

// Admin-only routes
router.post("/", verifyToken, verifyAdmin, addHotel);
router.put("/:id", verifyToken, verifyAdmin, updateHotel);
router.delete("/:id", verifyToken, verifyAdmin, deleteHotel);

module.exports = router;