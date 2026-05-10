require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

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

// Route: List Schools (Sorted by Proximity)
app.get('/listSchools', async (req, res) => {
    try {
        const userLat = parseFloat(req.query.latitude);
        const userLon = parseFloat(req.query.longitude);

        // Validation: Ensure the user provided their location
        if (isNaN(userLat) || isNaN(userLon)) {
            return res.status(400).json({ error: 'Please provide valid latitude and longitude in the URL.' });
        }

        // The Haversine formula in SQL to calculate distance in kilometers
        const query = `
            SELECT id, name, address, latitude, longitude,
            ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance
            FROM schools
            ORDER BY distance ASC
        `;
        
        const [rows] = await pool.execute(query, [userLat, userLon, userLat]);
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