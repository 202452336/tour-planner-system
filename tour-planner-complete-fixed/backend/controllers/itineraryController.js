const db = require("../config/db");

// Helper: frontend sends { activity, location, notes }
// DB column is activity_description — we store all three combined.
// Also supports legacy activity_description directly.
const resolveActivity = (body) => {
    const activity = body.activity_description || body.activity || "";
    const location = body.location || "";
    const notes = body.notes || "";
    let parts = [activity];
    if (location) parts.push(`Location: ${location}`);
    if (notes) parts.push(`Notes: ${notes}`);
    return parts.join(" | ");
};

// Create itinerary entry
const createItinerary = (req, res) => {
    const userId = req.user.id;
    const { tour_id, day_number, destination_id } = req.body;
    const activity_description = resolveActivity(req.body);

    if (!tour_id || !day_number || !activity_description) {
        return res.status(400).json({ message: "tour_id, day_number and activity are required" });
    }

    db.query("SELECT * FROM tour_plans WHERE id = ? AND user_id = ?", [tour_id, userId], (err, tourResults) => {
        if (err) return res.status(500).json({ message: "Error checking tour", error: err });
        if (tourResults.length === 0) return res.status(404).json({ message: "Tour not found or not allowed" });

        const insertQuery = `INSERT INTO itinerary (tour_id, day_number, activity_description, destination_id) VALUES (?, ?, ?, ?)`;
        db.query(insertQuery, [tour_id, day_number, activity_description, destination_id || null], (err, result) => {
            if (err) return res.status(500).json({ message: "Error creating itinerary", error: err });
            res.status(201).json({ message: "Itinerary created successfully", itineraryId: result.insertId });
        });
    });
};

// Get itinerary by tour - parses stored combined string back into fields
const getItineraryByTour = (req, res) => {
    const userId = req.user.id;
    const { tourId } = req.params;

    db.query("SELECT * FROM tour_plans WHERE id = ? AND user_id = ?", [tourId, userId], (err, tourResults) => {
        if (err) return res.status(500).json({ message: "Error checking tour", error: err });
        if (tourResults.length === 0) return res.status(404).json({ message: "Tour not found or not allowed" });

        const query = `
            SELECT i.*, d.name AS destination_name, d.location AS dest_location
            FROM itinerary i
            LEFT JOIN destinations d ON i.destination_id = d.id
            WHERE i.tour_id = ?
            ORDER BY i.day_number ASC
        `;
        db.query(query, [tourId], (err, results) => {
            if (err) return res.status(500).json({ message: "Error fetching itinerary", error: err });

            const parsed = results.map(row => {
                const raw = row.activity_description || "";
                const parts = raw.split(" | ");
                const activity = parts[0] || "";
                let location = "",
                    notes = "";
                parts.slice(1).forEach(p => {
                    if (p.startsWith("Location: ")) location = p.replace("Location: ", "");
                    else if (p.startsWith("Notes: ")) notes = p.replace("Notes: ", "");
                });
                return {...row, activity, location, notes };
            });

            res.status(200).json(parsed);
        });
    });
};

// Update itinerary entry
const updateItinerary = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { day_number, destination_id } = req.body;
    const activity_description = resolveActivity(req.body);

    if (!day_number || !activity_description) {
        return res.status(400).json({ message: "day_number and activity are required" });
    }

    const checkQuery = `SELECT i.* FROM itinerary i JOIN tour_plans t ON i.tour_id = t.id WHERE i.id = ? AND t.user_id = ?`;
    db.query(checkQuery, [id, userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error checking itinerary", error: err });
        if (results.length === 0) return res.status(404).json({ message: "Itinerary entry not found or not allowed" });

        db.query(
            "UPDATE itinerary SET day_number = ?, activity_description = ?, destination_id = ? WHERE id = ?", [day_number, activity_description, destination_id || null, id],
            (err) => {
                if (err) return res.status(500).json({ message: "Error updating itinerary", error: err });
                res.status(200).json({ message: "Itinerary updated successfully" });
            }
        );
    });
};

// Delete itinerary entry
const deleteItinerary = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const checkQuery = `SELECT i.* FROM itinerary i JOIN tour_plans t ON i.tour_id = t.id WHERE i.id = ? AND t.user_id = ?`;
    db.query(checkQuery, [id, userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error checking itinerary", error: err });
        if (results.length === 0) return res.status(404).json({ message: "Itinerary entry not found or not allowed" });

        db.query("DELETE FROM itinerary WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ message: "Error deleting itinerary", error: err });
            res.status(200).json({ message: "Itinerary deleted successfully" });
        });
    });
};

module.exports = { createItinerary, getItineraryByTour, updateItinerary, deleteItinerary };