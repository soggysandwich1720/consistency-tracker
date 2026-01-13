import { useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { getTodayDateString } from '../utils/dateUtils';

// Helper to check permission
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notifications');
        return false;
    }
    const result = await Notification.requestPermission();
    return result === 'granted';
};

const useScheduledNotifications = () => {
    const { tasks, history, today } = useTasks();
    const notifiedTasksRef = useRef(new Set()); // Keep track of tasks we alerted for in this session

    useEffect(() => {
        // Check every minute
        const interval = setInterval(() => {
            const now = new Date();
            const currentHours = String(now.getHours()).padStart(2, '0');
            const currentMinutes = String(now.getMinutes()).padStart(2, '0');
            const currentTimeStr = `${currentHours}:${currentMinutes}`;

            const todayDate = getTodayDateString();
            if (today !== todayDate) return; // Edge case if date changes while app open

            const todayData = history[today];
            if (!todayData) return;

            // Find tasks that match time AND are assigned AND not completed
            const pendingTasks = tasks.filter(t => {
                // Must be active
                if (t.isActive === false) return false;
                // Must have schedule
                if (!t.scheduledTime) return false;
                // Must match time
                if (t.scheduledTime !== currentTimeStr) return false;
                // Must be in today's assigned list
                if (!todayData.assigned.includes(t.id)) return false;
                // Must NOT be completed
                if (todayData.completed.includes(t.id)) return false;

                return true;
            });

            pendingTasks.forEach(task => {
                // Prevent double notification if interval fires multiple times within same minute 
                // (though setInterval 60000 shouldn't, but drift happens. using ref to be safe)
                // Ideally we reset the Set every minute, but a simpler way is:
                // Use a composite key "taskId-date-time"
                const key = `${task.id}-${today}-${currentTimeStr}`;

                if (!notifiedTasksRef.current.has(key)) {
                    if (Notification.permission === 'granted') {
                        new Notification(`Reminder: ${task.name}`, {
                            body: "It's time to complete your habit!",
                            icon: '/vite.svg' // default vite icon or nothing
                        });
                        notifiedTasksRef.current.add(key);
                    }
                }
            });

        }, 60 * 1000); // Check every 60 seconds

        return () => clearInterval(interval);
    }, [tasks, history, today]);

    return null;
};

export default useScheduledNotifications;
