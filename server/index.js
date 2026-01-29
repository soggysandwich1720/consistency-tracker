import express from 'express';
import cors from 'cors';
import db from './db.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});


app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tasks WHERE is_active = true ORDER BY created_at ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { id, name, priority, hasTimer, scheduledTime } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO tasks (id, name, priority, has_timer, scheduled_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, name, priority, hasTimer, scheduledTime]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE tasks SET is_active = false WHERE id = $1', [id]);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM history ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/history', async (req, res) => {
    const { date, taskId, isCompleted, timerSeconds } = req.body;
    console.log(`[DB] POST /api/history | Date: ${date}, Task: ${taskId}, Done: ${isCompleted}`);
    try {
        const result = await db.query(
            `INSERT INTO history (date, task_id, is_completed, timer_seconds) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (date, task_id) 
       DO UPDATE SET is_completed = EXCLUDED.is_completed, timer_seconds = EXCLUDED.timer_seconds
       RETURNING *`,
            [date, taskId, isCompleted, timerSeconds]
        );
        console.log(`[DB] Success:`, result.rows[0] ? 'Row updated' : 'No rows returned');
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`[DB] ERROR in POST /api/history:`, err.message);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

app.post('/api/history/init', async (req, res) => {
    const { date, activeTaskIds } = req.body;
    try {
        for (const taskId of activeTaskIds) {
            await db.query(
                'INSERT INTO history (date, task_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [date, taskId]
            );
        }
        res.json({ message: 'History initialized for ' + date });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
