const db = require("../config/db");

// Create budget for a tour
const createBudget = (req, res) => {
    const userId = req.user.id;
    const { tour_id, hotel_cost, transport_cost, other_cost } = req.body;

    if (!tour_id) {
        return res.status(400).json({
            message: "tour_id is required"
        });
    }

    const checkTourQuery = "SELECT * FROM tour_plans WHERE id = ? AND user_id = ?";

    db.query(checkTourQuery, [tour_id, userId], (err, tourResults) => {
        if (err) {
            return res.status(500).json({
                message: "Error checking tour",
                error: err
            });
        }

        if (tourResults.length === 0) {
            return res.status(404).json({
                message: "Tour not found or not allowed"
            });
        }

        const hCost = Number(hotel_cost) || 0;
        const tCost = Number(transport_cost) || 0;
        const oCost = Number(other_cost) || 0;
        const total_cost = hCost + tCost + oCost;

        const insertQuery = `
      INSERT INTO budget (tour_id, hotel_cost, transport_cost, other_cost, total_cost)
      VALUES (?, ?, ?, ?, ?)
    `;

        db.query(
            insertQuery, [tour_id, hCost, tCost, oCost, total_cost],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error creating budget",
                        error: err
                    });
                }

                res.status(201).json({
                    message: "Budget created successfully",
                    budgetId: result.insertId,
                    total_cost
                });
            }
        );
    });
};

// Get budget by tour ID
const getBudgetByTour = (req, res) => {
    const userId = req.user.id;
    const { tourId } = req.params;

    const checkTourQuery = "SELECT * FROM tour_plans WHERE id = ? AND user_id = ?";

    db.query(checkTourQuery, [tourId, userId], (err, tourResults) => {
        if (err) {
            return res.status(500).json({
                message: "Error checking tour",
                error: err
            });
        }

        if (tourResults.length === 0) {
            return res.status(404).json({
                message: "Tour not found or not allowed"
            });
        }

        const query = "SELECT * FROM budget WHERE tour_id = ?";

        db.query(query, [tourId], (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: "Error fetching budget",
                    error: err
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Budget not found for this tour"
                });
            }

            res.status(200).json(results[0]);
        });
    });
};

// Update budget
const updateBudget = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { hotel_cost, transport_cost, other_cost } = req.body;

    const checkQuery = `
    SELECT b.*
    FROM budget b
    JOIN tour_plans t ON b.tour_id = t.id
    WHERE b.id = ? AND t.user_id = ?
  `;

    db.query(checkQuery, [id, userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error checking budget",
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Budget not found or not allowed"
            });
        }

        const hCost = Number(hotel_cost) || 0;
        const tCost = Number(transport_cost) || 0;
        const oCost = Number(other_cost) || 0;
        const total_cost = hCost + tCost + oCost;

        const updateQuery = `
      UPDATE budget
      SET hotel_cost = ?, transport_cost = ?, other_cost = ?, total_cost = ?
      WHERE id = ?
    `;

        db.query(
            updateQuery, [hCost, tCost, oCost, total_cost, id],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error updating budget",
                        error: err
                    });
                }

                res.status(200).json({
                    message: "Budget updated successfully",
                    total_cost
                });
            }
        );
    });
};

// Delete budget
const deleteBudget = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const checkQuery = `
    SELECT b.*
    FROM budget b
    JOIN tour_plans t ON b.tour_id = t.id
    WHERE b.id = ? AND t.user_id = ?
  `;

    db.query(checkQuery, [id, userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error checking budget",
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Budget not found or not allowed"
            });
        }

        const deleteQuery = "DELETE FROM budget WHERE id = ?";

        db.query(deleteQuery, [id], (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error deleting budget",
                    error: err
                });
            }

            res.status(200).json({
                message: "Budget deleted successfully"
            });
        });
    });
};

module.exports = {
    createBudget,
    getBudgetByTour,
    updateBudget,
    deleteBudget
};