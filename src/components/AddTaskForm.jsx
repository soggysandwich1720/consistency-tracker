import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

const AddTaskForm = () => {
    const { addTask } = useTasks();
    const [name, setName] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [hasTimer, setHasTimer] = useState(false);
    const [scheduledTime, setScheduledTime] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        addTask(name, priority, hasTimer, scheduledTime);
        setName('');
        setPriority('Medium');
        setHasTimer(false);
        setScheduledTime('');
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    width: '100%',
                    padding: '16px', // Larger touch target
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-muted)',
                    marginTop: 'var(--spacing-md)',
                    fontSize: '1rem'
                }}
            >
                + Add New Daily Habit
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-md" style={{ background: 'var(--bg-secondary)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginTop: 'var(--spacing-md)' }}>
            <div className="flex flex-col gap-sm">
                <label className="text-sm text-muted">Habit / Task Name</label>
                <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. DSA Practice"
                />
            </div>

            <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                <div className="flex-col gap-sm" style={{ flex: 1, minWidth: '120px' }}>
                    <label className="text-sm text-muted">Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>

                <div className="flex-col gap-sm" style={{ flex: 1, minWidth: '100px' }}>
                    <label className="text-sm text-muted">Reminder Time (Optional)</label>
                    <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-sm">
                <input
                    type="checkbox"
                    id="timerCheck"
                    checked={hasTimer}
                    onChange={(e) => setHasTimer(e.target.checked)}
                    style={{ width: 'auto' }}
                />
                <label htmlFor="timerCheck" className="text-sm">Enable Stopwatch?</label>
            </div>

            <div className="flex gap-sm justify-between" style={{ marginTop: '8px' }}>
                <button type="button" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)' }}>Cancel</button>
                <button type="submit" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '6px 16px', borderRadius: 'var(--radius-sm)' }}>Save Habit</button>
            </div>
        </form>
    );
};

export default AddTaskForm;
