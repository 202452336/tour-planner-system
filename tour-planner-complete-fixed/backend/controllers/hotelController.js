const db = require("../config/db");
const hotelProvider = require("../services/hotelProviderService");

// Get all hotels
const getAllHotels = (req, res) => {
    const query = "SELECT * FROM hotels";

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching hotels",
                error: err
            });
        }

        res.status(200).json(results);
    });
};

// Get hotel by ID
const getHotelById = (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM hotels WHERE id = ?";

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching hotel",
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }

        res.status(200).json(results[0]);
    });
};

// Get hotels by destination
const getHotelsByDestination = async(req, res) => {
    const { destinationId } = req.params;
    const { checkInDate, checkOutDate, adults } = req.query;

    const defaultCheckIn = checkInDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const defaultCheckOut = checkOutDate || new Date(Date.now() + 172800000).toISOString().split('T')[0];

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
        const cityName = destination.name || destination.location;

        try {
            const hotels = await hotelProvider.searchHotels(cityName, defaultCheckIn, defaultCheckOut, adults || 1);

            if (Array.isArray(hotels) && hotels.length > 0) {
                return res.status(200).json(hotels);
            }
        } catch (apiErr) {
            console.warn('Hotel provider failed, falling back to DB:', apiErr.message);
        }

        // Fallback to local DB data if external API not available or results empty
        const hotelQuery = "SELECT * FROM hotels WHERE destination_id = ?";
        db.query(hotelQuery, [destinationId], (dbErr, results) => {
            if (dbErr) {
                return res.status(500).json({
                    message: "Error fetching hotels by destination",
                    error: dbErr
                });
            }

            res.status(200).json(results);
        });
    });
};

// Add hotel
const addHotel = (req, res) => {
    const {
        destination_id,
        hotel_name,
        hotel_type,
        price_per_night,
        rating
    } = req.body;

    if (!destination_id || !hotel_name || !price_per_night) {
        return res.status(400).json({
            message: "destination_id, hotel_name and price_per_night are required"
        });
    }

    const query = `
    INSERT INTO hotels (destination_id, hotel_name, hotel_type, price_per_night, rating)
    VALUES (?, ?, ?, ?, ?)
  `;

    db.query(
        query, [
            destination_id,
            hotel_name,
            hotel_type || null,
            price_per_night,
            rating || null
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error adding hotel",
                    error: err
                });
            }

            res.status(201).json({
                message: "Hotel added successfully",
                hotelId: result.insertId
            });
        }
    );
};

// Update hotel
const updateHotel = (req, res) => {
    const { id } = req.params;
    const {
        destination_id,
        hotel_name,
        hotel_type,
        price_per_night,
        rating
    } = req.body;

    if (!destination_id || !hotel_name || !price_per_night) {
        return res.status(400).json({
            message: "destination_id, hotel_name and price_per_night are required"
        });
    }

    const query = `
    UPDATE hotels
    SET destination_id = ?, hotel_name = ?, hotel_type = ?, price_per_night = ?, rating = ?
    WHERE id = ?
  `;

    db.query(
        query, [
            destination_id,
            hotel_name,
            hotel_type || null,
            price_per_night,
            rating || null,
            id
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Error updating hotel",
                    error: err
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Hotel not found"
                });
            }

            res.status(200).json({
                message: "Hotel updated successfully"
            });
        }
    );
};

// Delete hotel
const deleteHotel = (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM hotels WHERE id = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting hotel",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }

        res.status(200).json({
            message: "Hotel deleted successfully"
        });
    });
};

module.exports = {
    getAllHotels,
    getHotelById,
    getHotelsByDestination,
    addHotel,
    updateHotel,
    deleteHotel
};