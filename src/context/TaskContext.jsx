import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { getTodayDateString } from '../utils/dateUtils';

const API_BASE_URL = 'http://localhost:5000/api';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [history, setHistory] = useState({});
    const [loading, setLoading] = useState(true);
    const today = getTodayDateString();

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const tasksRes = await axios.get(`${API_BASE_URL}/tasks`);
                const historyRes = await axios.get(`${API_BASE_URL}/history`);

                setTasks(tasksRes.data);

                const activeTaskIdsSet = new Set(tasksRes.data.map(t => t.id));
                const transformedHistory = historyRes.data.reduce((acc, row) => {
                    const dateStr = new Date(row.date).toISOString().split('T')[0];
                    if (!acc[dateStr]) {
                        acc[dateStr] = { assigned: [], completed: [], timers: {} };
                    }

                    // Only include in calculations if the task is still active
                    if (activeTaskIdsSet.has(row.task_id)) {
                        acc[dateStr].assigned.push(row.task_id);
                        if (row.is_completed) {
                            acc[dateStr].completed.push(row.task_id);
                        }
                        if (row.timer_seconds > 0) {
                            acc[dateStr].timers[row.task_id] = row.timer_seconds;
                        }
                    }
                    return acc;
                }, {});

                setHistory(transformedHistory);

                // Initialize today if it doesn't exist
                if (!transformedHistory[today]) {
                    const activeTaskIds = tasksRes.data.filter(t => t.is_active !== false).map(t => t.id);
                    await axios.post(`${API_BASE_URL}/history/init`, {
                        date: today,
                        activeTaskIds
                    });

                    setHistory(prev => ({
                        ...prev,
                        [today]: {
                            assigned: activeTaskIds,
                            completed: [],
                            timers: {}
                        }
                    }));
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [today]);

    const addTask = async (name, priority, hasTimer, scheduledTime) => {
        const newTask = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            name,
            priority,
            hasTimer,
            scheduledTime,
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/tasks`, newTask);
            setTasks(prev => [...prev, res.data]);

            // Update today's assignment
            await axios.post(`${API_BASE_URL}/history/init`, {
                date: today,
                activeTaskIds: [res.data.id]
            });

            setHistory(prev => {
                const todayData = prev[today] || { assigned: [], completed: [], timers: {} };
                return {
                    ...prev,
                    [today]: {
                        ...todayData,
                        assigned: [...todayData.assigned, res.data.id]
                    }
                };
            });
        } catch (err) {
            console.error('Error adding task:', err);
        }
    };

    const toggleTaskCompletion = async (taskId) => {
        const todayData = history[today];
        if (!todayData) return;

        const isCompleted = !todayData.completed.includes(taskId);
        const timerSeconds = todayData.timers[taskId] || 0;

        try {
            await axios.post(`${API_BASE_URL}/history`, {
                date: today,
                taskId,
                isCompleted,
                timerSeconds
            });

            setHistory(prev => {
                const day = prev[today];
                const newCompleted = isCompleted
                    ? [...day.completed, taskId]
                    : day.completed.filter(id => id !== taskId);

                return {
                    ...prev,
                    [today]: { ...day, completed: newCompleted }
                };
            });
        } catch (err) {
            console.error('Error toggling completion:', err);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_active: false } : t));

            setHistory(prev => {
                const day = prev[today];
                if (!day) return prev;
                return {
                    ...prev,
                    [today]: {
                        ...day,
                        assigned: day.assigned.filter(id => id !== taskId),
                        completed: day.completed.filter(id => id !== taskId)
                    }
                };
            });
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const updateTimer = async (taskId, seconds) => {
        const todayData = history[today];
        if (!todayData) return;

        try {
            await axios.post(`${API_BASE_URL}/history`, {
                date: today,
                taskId,
                isCompleted: todayData.completed.includes(taskId),
                timerSeconds: seconds
            });

            setHistory(prev => ({
                ...prev,
                [today]: {
                    ...prev[today],
                    timers: { ...prev[today].timers, [taskId]: seconds }
                }
            }));
        } catch (err) {
            console.error('Error updating timer:', err);
        }
    };

    const value = {
        tasks,
        history,
        today,
        loading,
        addTask,
        toggleTaskCompletion,
        deleteTask,
        updateTimer
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};
