const express = require("express");
const router = express.Router();

const {
    getAllDestinations,
    getDestinationById,
    addDestination,
    updateDestination,
    deleteDestination,
} = require("../controllers/destinationController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllDestinations);
router.get("/:id", getDestinationById);

// Admin-only routes
router.post("/", verifyToken, verifyAdmin, addDestination);
router.put("/:id", verifyToken, verifyAdmin, updateDestination);
router.delete("/:id", verifyToken, verifyAdmin, deleteDestination);

module.exports = router;