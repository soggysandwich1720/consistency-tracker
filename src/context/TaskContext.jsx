import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { getTodayDateString } from '../utils/dateUtils';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${VITE_API_URL.replace(/\/$/, '')}/api`;

console.log('TaskContext: API_BASE_URL is', API_BASE_URL);


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
            console.log('TaskContext: fetchData started');
            const minLoadingTime = 2600;
            const timer = new Promise(resolve => setTimeout(resolve, minLoadingTime));

            try {
                console.log('TaskContext: Fetching tasks and history from', API_BASE_URL);
                const [tasksRes, historyRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/tasks`, { timeout: 5000 }),
                    axios.get(`${API_BASE_URL}/history`, { timeout: 5000 })
                ]);

                console.log(`TaskContext: Received ${tasksRes.data.length} tasks and ${historyRes.data.length} history rows`);

                setTasks(tasksRes.data);
                const activeTaskIdsSet = new Set(tasksRes.data.map(t => t.id));
                const transformedHistory = historyRes.data.reduce((acc, row) => {
                    const rawDate = new Date(row.date);
                    const dateStr = `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}`;

                    if (!acc[dateStr]) {
                        acc[dateStr] = { assigned: [], completed: [], timers: {} };
                    }
                    if (activeTaskIdsSet.has(row.task_id)) {
                        acc[dateStr].assigned.push(row.task_id);
                        if (row.is_completed) acc[dateStr].completed.push(row.task_id);
                        if (row.timer_seconds > 0) acc[dateStr].timers[row.task_id] = row.timer_seconds;
                    }
                    return acc;
                }, {});

                console.log('TaskContext: Transformed history keys:', Object.keys(transformedHistory));
                setHistory(transformedHistory);

                if (!transformedHistory[today]) {
                    console.log('TaskContext: Today\'s history missing. Initializing for', today);
                    const activeTaskIds = tasksRes.data.filter(t => t.is_active !== false).map(t => t.id);
                    try {
                        const initRes = await axios.post(`${API_BASE_URL}/history/init`, { date: today, activeTaskIds }, { timeout: 5000 });
                        console.log('TaskContext: History init success:', initRes.data);
                        setHistory(prev => ({
                            ...prev,
                            [today]: { assigned: activeTaskIds, completed: [], timers: {} }
                        }));
                    } catch (initErr) {
                        console.error('TaskContext: Failed to initialize today\'s history:', initErr.message);
                    }
                }
            } catch (err) {
                console.error('TaskContext: Critical fetch error:', err.message);
                if (err.response) {
                    console.error('TaskContext: Server responded with:', err.response.status, err.response.data);
                }
                console.warn('Database offline or connection failed. Showing UI anyway.');
            } finally {
                console.log('TaskContext: fetchData finished, waiting for timer...');
                await timer;
                console.log('TaskContext: Loading set to false');
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

    const calculateAverage = (days) => {
        let sum = 0;
        let daysWithData = 0;
        const checkDate = new Date();
        for (let i = 0; i < days; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const entry = history[dateStr];
            if (entry && entry.assigned && entry.assigned.length > 0) {
                sum += Math.round((entry.completed.length / entry.assigned.length) * 100);
                daysWithData++;
            }
            checkDate.setDate(checkDate.getDate() - 1);
        }
        return daysWithData === 0 ? 0 : Math.round(sum / daysWithData);
    };

    const calculateCurrentStreak = () => {
        let streak = 0;
        let checkDate = new Date();
        for (let i = 0; i < 365; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const entry = history[dateStr];
            if (entry && entry.completed.length > 0) {
                streak++;
            } else if (dateStr !== today) {
                break;
            }
            checkDate.setDate(checkDate.getDate() - 1);
        }
        return streak;
    };

    const consistencyScore = (() => {
        // Get all historical dates and sort them descending (newest first)
        const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));

        let activeDaysCount = 0;
        let sum = 0;
        const targetDays = 7;

        for (const dateStr of sortedDates) {
            if (activeDaysCount >= targetDays) break;

            const entry = history[dateStr];
            if (entry && entry.assigned && entry.assigned.length > 0) {
                const completionRate = (entry.completed.length / entry.assigned.length) * 100;

                // Only count days where some work was done (> 0%)
                if (completionRate > 0) {
                    sum += Math.round(completionRate);
                    activeDaysCount++;
                }
            }
        }

        if (activeDaysCount === 0) return 0;
        return Math.round(sum / activeDaysCount);
    })();

    const value = {
        tasks,
        history,
        today,
        loading,
        addTask,
        toggleTaskCompletion,
        deleteTask,
        updateTimer,
        calculateAverage,
        calculateCurrentStreak,
        consistencyScore
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};
