const db = require("../config/db");

// Create a new tour
const createTour = (req, res) => {
    const userId = req.user.id;
    const { title, start_date, end_date, total_days, status } = req.body;

    if (!title || !start_date || !end_date || !total_days) {
        return res.status(400).json({
            message: "title, start_date, end_date and total_days are required"
        });
    }

    const query = `
    INSERT INTO tour_plans (user_id, title, start_date, end_date, total_days, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    db.query(
        query, [userId, title, start_date, end_date, total_days, status || "planned"],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error creating tour",
                    error: err
                });
            }

            res.status(201).json({
                message: "Tour created successfully",
                tourId: result.insertId
            });
        }
    );
};

// Get all tours of logged-in user
const getMyTours = (req, res) => {
    const userId = req.user.id;

    const query = "SELECT * FROM tour_plans WHERE user_id = ? ORDER BY id DESC";

    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching tours",
                error: err
            });
        }

        res.status(200).json(results);
    });
};

// Get single tour by ID
const getTourById = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const query = "SELECT * FROM tour_plans WHERE id = ? AND user_id = ?";

    db.query(query, [id, userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching tour",
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Tour not found"
            });
        }

        res.status(200).json(results[0]);
    });
};

// Update tour
const updateTour = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, start_date, end_date, total_days, status } = req.body;

    if (!title || !start_date || !end_date || !total_days) {
        return res.status(400).json({
            message: "title, start_date, end_date and total_days are required"
        });
    }

    const query = `
    UPDATE tour_plans
    SET title = ?, start_date = ?, end_date = ?, total_days = ?, status = ?
    WHERE id = ? AND user_id = ?
  `;

    db.query(
        query, [title, start_date, end_date, total_days, status || "planned", id, userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error updating tour",
                    error: err
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Tour not found or not allowed"
                });
            }

            res.status(200).json({
                message: "Tour updated successfully"
            });
        }
    );
};

// Delete tour
const deleteTour = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const query = "DELETE FROM tour_plans WHERE id = ? AND user_id = ?";

    db.query(query, [id, userId], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting tour",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Tour not found or not allowed"
            });
        }

        res.status(200).json({
            message: "Tour deleted successfully"
        });
    });
};

module.exports = {
    createTour,
    getMyTours,
    getTourById,
    updateTour,
    deleteTour
};