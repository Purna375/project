const dotenv = require("dotenv");
const db = require("./src/config/db.js");
dotenv.config();

db.getConnection()
    .then((connection) => {
        console.log("MySQL Database Connected Successfully!");
        connection.release();
    })
    .catch((err) => {
        console.error("Database Connection Failed:", err.message);
    });

const bcrypt = require('bcrypt');

const createAdmin = async () => {
    const hashedPassword = await bcrypt.hash('vsvk.v', 10);

    try {
        const [rows] = await db.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            ['vsaivamsikrishna.vadlamani@gmail.com', hashedPassword, 'admin']
        );
        console.log('Admin created successfully');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        db.end();
    }
};

createAdmin();