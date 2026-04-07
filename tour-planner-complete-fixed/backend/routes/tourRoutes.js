const express = require("express");
const router = express.Router();

const {
    createTour,
    getMyTours,
    getTourById,
    updateTour,
    deleteTour
} = require("../controllers/tourController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, createTour);
router.get("/", verifyToken, getMyTours);
router.get("/:id", verifyToken, getTourById);
router.put("/:id", verifyToken, updateTour);
router.delete("/:id", verifyToken, deleteTour);

module.exports = router;