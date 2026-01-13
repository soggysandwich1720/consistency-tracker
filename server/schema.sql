-- Database Schema for Consistency Tracker

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    priority TEXT NOT NULL,
    has_timer BOOLEAN DEFAULT FALSE,
    scheduled_time TEXT, -- "HH:MM"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS history (
    date DATE NOT NULL,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    timer_seconds INTEGER DEFAULT 0,
    PRIMARY KEY (date, task_id)
);
