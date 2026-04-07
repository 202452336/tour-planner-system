const express = require("express");
const router = express.Router();

const {
    createBudget,
    getBudgetByTour,
    updateBudget,
    deleteBudget
} = require("../controllers/budgetController");

const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, createBudget);
router.get("/tour/:tourId", verifyToken, getBudgetByTour);
router.put("/:id", verifyToken, updateBudget);
router.delete("/:id", verifyToken, deleteBudget);

module.exports = router;