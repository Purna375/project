const pool = require("../config/db");

const authorizeAdmin = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const [rows] = await pool.execute("SELECT role FROM users WHERE user_id = ?", [userId]);
        if (rows.length === 0) return res.status(404).json({ message: "User not found" });

        if (rows[0].role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

module.exports = authorizeAdmin;