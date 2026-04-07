const db = require("../config/db");
const transportProvider = require("../services/transportProviderService");

// Get all transport options
const getAllTransport = (req, res) => {
    const query = "SELECT * FROM transport";

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching transport options",
                error: err
            });
        }

        res.status(200).json(results);
    });
};

// Get transport by ID
const getTransportById = (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM transport WHERE id = ?";

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching transport option",
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Transport option not found"
            });
        }

        res.status(200).json(results[0]);
    });
};

// Get transport by source and destination
const getTransportByRoute = async(req, res) => {
    const { sourceId, destinationId } = req.params;
    const { departureDate, returnDate, adults } = req.query;

    const defaultDeparture = departureDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const defaultReturn = returnDate || new Date(Date.now() + 172800000).toISOString().split('T')[0];

    const sourceQuery = "SELECT * FROM destinations WHERE id = ?";
    db.query(sourceQuery, [sourceId], (sourceErr, sourceResults) => {
        if (sourceErr) {
            return res.status(500).json({
                message: "Error fetching source destination",
                error: sourceErr
            });
        }

        if (sourceResults.length === 0) {
            return res.status(404).json({ message: "Source destination not found" });
        }

        const destQuery = "SELECT * FROM destinations WHERE id = ?";
        db.query(destQuery, [destinationId], async(destErr, destResults) => {
            if (destErr) {
                return res.status(500).json({
                    message: "Error fetching destination",
                    error: destErr
                });
            }

            if (destResults.length === 0) {
                return res.status(404).json({ message: "Destination not found" });
            }

            const source = sourceResults[0];
            const destination = destResults[0];

            const sourceCityName = source.location || source.name;
            const destCityName = destination.location || destination.name;

            try {
                const flights = await transportProvider.searchFlights(sourceCityName, destCityName, defaultDeparture, defaultReturn, adults || 1);

                if (Array.isArray(flights) && flights.length > 0) {
                    return res.status(200).json(flights);
                }
            } catch (apiErr) {
                console.warn('Transport provider failed, falling back to DB:', apiErr.message);
            }

            // Fallback local transport database query
            const query = "SELECT * FROM transport WHERE source_destination_id = ? AND destination_id = ?";
            db.query(query, [sourceId, destinationId], (err, results) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error fetching transport by route",
                        error: err
                    });
                }

                res.status(200).json(results);
            });
        });
    });
};

// Get transport by destination
const getTransportByDestination = async(req, res) => {
    const { destinationId } = req.params;

    const destinationQuery = "SELECT * FROM destinations WHERE id = ?";

    db.query(destinationQuery, [destinationId], async(err, destResults) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching destination",
                error: err
            });
        }

        if (destResults.length === 0) {
            return res.status(404).json({ message: "Destination not found" });
        }

        const destination = destResults[0];
        const cityName = destination.location || destination.name;

        try {
            const transports = await transportProvider.searchTransport(cityName);

            if (Array.isArray(transports) && transports.length > 0) {
                return res.status(200).json(transports);
            }
        } catch (apiErr) {
            console.warn('Transport provider failed, falling back to DB:', apiErr.message);
        }

        // Fallback to local DB data
        const transportQuery = "SELECT * FROM transport WHERE destination_id = ?";
        db.query(transportQuery, [destinationId], (dbErr, results) => {
            if (dbErr) {
                return res.status(500).json({
                    message: "Error fetching transport by destination",
                    error: dbErr
                });
            }

            res.status(200).json(results);
        });
    });
};

// Add transport
const addTransport = (req, res) => {
    const {
        source_destination_id,
        destination_id,
        mode,
        price,
        duration
    } = req.body;

    if (!source_destination_id || !destination_id || !mode || !price) {
        return res.status(400).json({
            message: "source_destination_id, destination_id, mode and price are required"
        });
    }

    const query = `
    INSERT INTO transport (source_destination_id, destination_id, mode, price, duration)
    VALUES (?, ?, ?, ?, ?)
  `;

    db.query(
        query, [
            source_destination_id,
            destination_id,
            mode,
            price,
            duration || null
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error adding transport option",
                    error: err
                });
            }

            res.status(201).json({
                message: "Transport option added successfully",
                transportId: result.insertId
            });
        }
    );
};

// Update transport
const updateTransport = (req, res) => {
    const { id } = req.params;
    const {
        source_destination_id,
        destination_id,
        mode,
        price,
        duration
    } = req.body;

    if (!source_destination_id || !destination_id || !mode || !price) {
        return res.status(400).json({
            message: "source_destination_id, destination_id, mode and price are required"
        });
    }

    const query = `
    UPDATE transport
    SET source_destination_id = ?, destination_id = ?, mode = ?, price = ?, duration = ?
    WHERE id = ?
  `;

    db.query(
        query, [
            source_destination_id,
            destination_id,
            mode,
            price,
            duration || null,
            id
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error updating transport option",
                    error: err
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Transport option not found"
                });
            }

            res.status(200).json({
                message: "Transport option updated successfully"
            });
        }
    );
};

// Delete transport
const deleteTransport = (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM transport WHERE id = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting transport option",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Transport option not found"
            });
        }

        res.status(200).json({
            message: "Transport option deleted successfully"
        });
    });
};

module.exports = {
    getAllTransport,
    getTransportById,
    getTransportByRoute,
    getTransportByDestination,
    addTransport,
    updateTransport,
    deleteTransport
};