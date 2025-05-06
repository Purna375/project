const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "8144268322",
    database: process.env.DB_NAME || "",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database Connection Failed:", err.message);
    } else {
        console.log("MySQL Database Connected Successfully!");
        connection.release();
    }
});

module.exports = pool.promise();
