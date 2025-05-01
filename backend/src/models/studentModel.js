const db = require("../config/db");

const Student = {
    addStudent: async (userId, name, rollNo, branch, email, phone) => {
        const sql =
            "INSERT INTO students (user_id, name, roll_no, branch, email, phone) VALUES (?, ?, ?, ?, ?, ?)";
        await db.execute(sql, [userId, name, rollNo, branch, email, phone]);
    },

    getStudentsByUser: async (userId) => {
        const sql = "SELECT * FROM students WHERE user_id = ?";
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    },

    countStudentsByUser: async (userId) => {
        const sql = "SELECT COUNT(*) AS count FROM students WHERE user_id = ?";
        const [[{ count }]] = await db.execute(sql, [userId]);
        return count;
    },
};

module.exports = Student;