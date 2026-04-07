const express = require("express");
const router = express.Router();

const {
    createItinerary,
    getItineraryByTour,
    updateItinerary,
    deleteItinerary
} = require("../controllers/itineraryController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, createItinerary);
router.get("/tour/:tourId", verifyToken, getItineraryByTour);
router.put("/:id", verifyToken, updateItinerary);
router.delete("/:id", verifyToken, deleteItinerary);

module.exports = router;