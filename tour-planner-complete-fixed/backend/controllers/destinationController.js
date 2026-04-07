const db = require("../config/db");

// Get all destinations
const getAllDestinations = (req, res) => {
    const query = "SELECT * FROM destinations ORDER BY id DESC";

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching destinations",
                error: err,
            });
        }

        res.status(200).json(results);
    });
};

// Get destination by ID
const getDestinationById = (req, res) => {
    const { id } = req.params;

    const query = "SELECT * FROM destinations WHERE id = ?";

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching destination",
                error: err,
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Destination not found" });
        }

        res.status(200).json(results[0]);
    });
};

// Add destination
const addDestination = (req, res) => {
    const { name, location, description, estimated_days, image_url, source } = req.body;

    if (!name || !location) {
        return res.status(400).json({
            message: "Name and location are required",
        });
    }

    const query = `
    INSERT INTO destinations (name, location, description, estimated_days, image_url, source)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    db.query(
        query, [
            name,
            location,
            description || "",
            estimated_days || null,
            image_url || "",
            source || "admin",
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error adding destination",
                    error: err,
                });
            }

            res.status(201).json({
                message: "Destination added successfully",
                id: result.insertId,
            });
        }
    );
};

// Update destination
const updateDestination = (req, res) => {
    const { id } = req.params;
    const { name, location, description, estimated_days, image_url, source } = req.body;

    const query = `
    UPDATE destinations
    SET name = ?, location = ?, description = ?, estimated_days = ?, image_url = ?, source = ?
    WHERE id = ?
  `;

    db.query(
        query, [
            name,
            location,
            description || "",
            estimated_days || null,
            image_url || "",
            source || "admin",
            id,
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error updating destination",
                    error: err,
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Destination not found" });
            }

            res.status(200).json({
                message: "Destination updated successfully",
            });
        }
    );
};

// Delete destination
const deleteDestination = (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM destinations WHERE id = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting destination",
                error: err,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Destination not found" });
        }

        res.status(200).json({
            message: "Destination deleted successfully",
        });
    });
};

module.exports = {
    getAllDestinations,
    getDestinationById,
    addDestination,
    updateDestination,
    deleteDestination,
};