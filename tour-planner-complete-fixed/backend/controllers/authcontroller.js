const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async(req, res) => {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ message: "Name, email and password are required" });

    // Only allow 'user' or 'admin'
    const assignedRole = role === "admin" ? "admin" : "user";

    db.query("SELECT * FROM users WHERE email = ?", [email], async(err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (result.length > 0) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)", [name, email, phone || null, hashedPassword, assignedRole],
            (err, data) => {
                if (err) return res.status(500).json({ message: "Error registering user", error: err });
                res.status(201).json({ message: "User registered successfully", userId: data.insertId });
            }
        );
    });
};

const loginUser = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email and password are required" });

    db.query("SELECT * FROM users WHERE email = ?", [email], async(err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (result.length === 0) return res.status(404).json({ message: "User not found" });

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    });
};

// Update profile
const updateProfile = (req, res) => {
    const userId = req.user.id;
    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    db.query("UPDATE users SET name = ?, phone = ? WHERE id = ?", [name, phone || null, userId], (err) => {
        if (err) return res.status(500).json({ message: "Error updating profile", error: err });
        db.query("SELECT id, name, email, phone, role FROM users WHERE id = ?", [userId], (err, rows) => {
            if (err) return res.status(500).json({ message: "Error fetching updated user" });
            res.status(200).json({ message: "Profile updated successfully", user: rows[0] });
        });
    });
};

// Change password
const changePassword = async(req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
        return res.status(400).json({ message: "Current and new password are required" });

    db.query("SELECT * FROM users WHERE id = ?", [userId], async(err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

        const hashed = await bcrypt.hash(newPassword, 10);
        db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, userId], (err) => {
            if (err) return res.status(500).json({ message: "Error changing password" });
            res.status(200).json({ message: "Password changed successfully" });
        });
    });
};

// Admin: get all users
const getAllUsers = (req, res) => {
    db.query("SELECT id, name, email, phone, role, created_at FROM users ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ message: "Error fetching users", error: err });
        res.status(200).json(rows);
    });
};

// Admin: get all tours with user info
const getAllTours = (req, res) => {
    const query = `
        SELECT t.*, u.name as user_name, u.email as user_email
        FROM tour_plans t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.id DESC
    `;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).json({ message: "Error fetching tours", error: err });
        res.status(200).json(rows);
    });
};

module.exports = { registerUser, loginUser, updateProfile, changePassword, getAllUsers, getAllTours };