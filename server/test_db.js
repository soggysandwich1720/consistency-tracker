const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'consistency_tracker',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function testConnection() {
    try {
        console.log('Testing connection with config:', {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        const res = await pool.query('SELECT current_database()');
        console.log('Connected to database:', res.rows[0].current_database);

        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables in public schema:', tables.rows.map(t => t.table_name));

        if (!tables.rows.find(t => t.table_name === 'tasks')) {
            console.error('CRITICAL: "tasks" table is missing!');
        }
        if (!tables.rows.find(t => t.table_name === 'history')) {
            console.error('CRITICAL: "history" table is missing!');
        }

    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await pool.end();
    }
}

testConnection();
