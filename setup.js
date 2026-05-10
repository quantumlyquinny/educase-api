require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTable() {
    try {
        console.log("Connecting to AWS Database...");
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("Connection successful! Creating table...");

        // The SQL command to create the schools table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS schools (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address VARCHAR(255) NOT NULL,
                latitude FLOAT NOT NULL,
                longitude FLOAT NOT NULL
            )
        `;

        await db.execute(createTableQuery);
        console.log("✅ 'schools' table is ready to go!");

        await db.end(); // Close the connection
    } catch (error) {
        console.error("❌ Error setting up database:", error.message);
    }
}

createTable();