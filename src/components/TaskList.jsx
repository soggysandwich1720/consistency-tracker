import React from 'react';
import { useTasks } from '../context/TaskContext';
import TaskItem from './TaskItem';

const TaskList = () => {
    const { tasks, history, today } = useTasks();

    // Get today's assigned tasks
    // History structure: { [date]: { assigned: [ids], completed: [ids] } }
    const todayData = history[today];

    if (!todayData) {
        return <div className="text-muted text-sm">Loading today's schedule...</div>;
    }

    const assignedIds = todayData.assigned || [];

    // Filter tasks to get full objects of assigned tasks
    const dailyTasks = assignedIds
        .map(id => tasks.find(t => t.id === id))
        .filter(Boolean); // Remove if not found (deleted hard?)

    // Sort by priority logic (High > Medium > Low) + Completed last
    const priorityScore = { 'High': 3, 'Medium': 2, 'Low': 1 };

    const sortedTasks = [...dailyTasks].sort((a, b) => {
        const aCompleted = todayData.completed.includes(a.id);
        const bCompleted = todayData.completed.includes(b.id);

        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
        return priorityScore[b.priority] - priorityScore[a.priority];
    });

    if (sortedTasks.length === 0) {
        return (
            <div className="text-muted text-center" style={{ padding: 'var(--spacing-lg)' }}>
                No daily tasks setup. Add one below!
            </div>
        )
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
        }}>
            {sortedTasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    isCompleted={todayData.completed.includes(task.id)}
                />
            ))}
        </div>
    );
};

export default TaskList;
