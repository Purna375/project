const db = require("../config/db");

const User = {
    createUser: async (email, hashedPassword) => {
        const sql = "INSERT INTO users (email, password) VALUES (?, ?)";
        await db.execute(sql, [email, hashedPassword]);
    },

    findUserByEmail: async (email) => {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [rows] = await db.execute(sql, [email]);
        return rows.length ? rows[0] : null;
    },

    verifyUser: async (email) => {
        const sql = "UPDATE users SET is_verified = 1 WHERE email = ?";
        await db.execute(sql, [email]);
    },
};

module.exports = User;