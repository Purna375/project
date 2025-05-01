const pool = require("../config/db");

const generateProjectCode = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');

    const [rows] = await pool.execute(
        `SELECT COUNT(*) AS count FROM projects WHERE DATE(created_at) = CURDATE()`
    );
    const projectNumber = rows[0].count + 1;

    return `HT${date}${month}${year}${projectNumber}`;
};

module.exports = generateProjectCode;