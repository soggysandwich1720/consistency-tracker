import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';

const PriorityDot = ({ priority }) => {
    const color = {
        'High': 'var(--accent-error)',
        'Medium': 'var(--accent-warning)',
        'Low': '#2196F3' // Blue
    }[priority] || 'var(--text-muted)';

    return (
        <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block',
            marginLeft: '8px'
        }} title={`Priority: ${priority}`} />
    );
};

const Timer = ({ taskId, initialSeconds }) => {
    const { updateTimer } = useTasks();
    const [seconds, setSeconds] = useState(initialSeconds || 0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setSeconds(initialSeconds || 0);
    }, [initialSeconds]);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
            updateTimer(taskId, seconds);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, taskId, updateTimer]);

    // Cleanup on unmount (save progress)
    useEffect(() => {
        return () => {
            if (isActive) updateTimer(taskId, seconds);
        }
    }, [isActive]);


    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <button
            className="flex items-center gap-sm text-sm"
            onClick={(e) => { e.stopPropagation(); setIsActive(!isActive); }}
            style={{
                background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                minWidth: '60px',
                justifyContent: 'center'
            }}
        >
            <span>{isActive ? '⏸' : '▶'}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(seconds)}</span>
        </button>
    )
}

const TaskItem = ({ task, isCompleted }) => {
    const { toggleTaskCompletion, deleteTask, history, today } = useTasks();
    const [isHovered, setIsHovered] = useState(false);

    // Get current timer value from history
    const savedTime = history[today]?.timers?.[task.id] || 0;

    return (
        <div
            className="flex items-center justify-between"
            style={{
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '8px',
                opacity: isCompleted ? 0.5 : 1,
                transition: 'opacity 0.2s'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center gap-md" style={{ flex: 1 }}>
                <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleTaskCompletion(task.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-success)' }}
                />
                <div className="flex flex-col"> {/* This div wraps the task name, priority, and scheduled time */}
                    <div className="flex items-center">
                        <span style={{
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)'
                        }}>
                            {task.name}
                        </span>
                        <PriorityDot priority={task.priority} />
                    </div>
                    {task.scheduledTime && (
                        <div className="text-muted text-sm flex items-center gap-sm" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                            <span role="img" aria-label="clock">⏰</span> {task.scheduledTime}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-md">
                {task.hasTimer && (
                    <Timer taskId={task.id} initialSeconds={savedTime} />
                )}

                {isHovered && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this routine?')) deleteTask(task.id);
                        }}
                        style={{ color: 'var(--text-muted)', fontSize: '1.2rem', padding: '0 4px' }}
                        title="Delete task"
                    >
                        &times;
                    </button>
                )}
            </div>
        </div >
    );
};

export default TaskItem;
