const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Tasks Routes ---

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tasks WHERE is_active = true ORDER BY created_at ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Add a new task
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

// Soft delete a task
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

// --- History Routes ---

// Get all history
app.get('/api/history', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM history ORDER BY date DESC');
        // Group history by date for front-end convenience
        const groupedHistory = result.rows.reduce((acc, row) => {
            const dateStr = row.date.toISOString().split('T')[0];
            if (!acc[dateStr]) {
                acc[dateStr] = { assigned: [], completed: [], timers: {} };
            }
            // We'll need a way to track "assigned" vs "available"
            // For now, let's just send the raw rows or a better structure
            return acc;
        }, {});

        // Actually, it's simpler to let the frontend handle the mapping or send a clean structure
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Save/Update history entry
app.post('/api/history', async (req, res) => {
    const { date, taskId, isCompleted, timerSeconds } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO history (date, task_id, is_completed, timer_seconds) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (date, task_id) 
       DO UPDATE SET is_completed = EXCLUDED.is_completed, timer_seconds = EXCLUDED.timer_seconds
       RETURNING *`,
            [date, taskId, isCompleted, timerSeconds]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Sync today's assignment (Initialization logic)
app.post('/api/history/init', async (req, res) => {
    const { date, activeTaskIds } = req.body;
    try {
        // For each active task, ensure an entry exists in history for that date
        // This is primarily to record what was "assigned" even if 0% completion
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
