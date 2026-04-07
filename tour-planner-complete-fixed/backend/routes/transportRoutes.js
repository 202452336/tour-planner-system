const express = require("express");
const router = express.Router();

const {
    getAllTransport,
    getTransportById,
    getTransportByRoute,
    getTransportByDestination,
    addTransport,
    updateTransport,
    deleteTransport
} = require("../controllers/transportController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllTransport);
router.get("/route/:sourceId/:destinationId", getTransportByRoute);
router.get("/destination/:destinationId", getTransportByDestination);
router.get("/:id", getTransportById);

// Admin-only routes
router.post("/", verifyToken, verifyAdmin, addTransport);
router.put("/:id", verifyToken, verifyAdmin, updateTransport);
router.delete("/:id", verifyToken, verifyAdmin, deleteTransport);

module.exports = router;