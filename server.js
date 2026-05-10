require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

// THIS IS THE LINE THAT WAS MISSING:
const port = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Route: List Schools
app.get('/listSchools', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM schools');
        res.status(200).json(rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: 'Failed to fetch schools.' });
    }
});

// Route: Add School
app.post('/addSchool', async (req, res) => {
    try {
        const { name, address, latitude, longitude } = req.body;
        if (!name || !address || !latitude || !longitude) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(query, [name, address, latitude, longitude]);
        res.status(201).json({ id: result.insertId, message: 'School added!' });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: 'Database insertion failed' });
    }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 API is live on port ${port}`);
});