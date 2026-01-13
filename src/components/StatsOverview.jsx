import React from 'react';
import { useTasks } from '../context/TaskContext';

const StatsOverview = () => {
    const { history, today } = useTasks();

    const getDailyCompletion = (date) => {
        const entry = history[date];
        if (!entry || !entry.assigned || entry.assigned.length === 0) return 0;
        return Math.round((entry.completed.length / entry.assigned.length) * 100);
    };

    const calculateStreak = () => {
        // Current streak: Count backwards from yesterday (or today if completed something)
        // "Streak history (days with >= 1 task completed)"
        const dates = Object.keys(history).sort(); // Sort strings works for ISO YYYY-MM-DD
        if (dates.length === 0) return 0;

        // Check backwards
        let streak = 0;
        // If today has activity, include it? Usually streak updates live.
        // If today is 0, check yesterday.

        // We iterate backwards from today
        let checkDate = new Date();

        // Safety break
        for (let i = 0; i < 365; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const entry = history[dateStr];

            if (entry && entry.completed.length > 0) {
                streak++;
            } else {
                // If it's TODAY and logic is "streak continues if you do it today", 
                // but if I haven't done it yet, does it break?
                // Usually streak breaks if YESTERDAY was missed. 
                // If Today is missed so far, it shouldn't reset streak yet.
                if (dateStr === today) {
                    // ignore today if empty, continue to yesterday
                } else {
                    break; // streak broken
                }
            }
            checkDate.setDate(checkDate.getDate() - 1);
        }
        return streak;
    };

    const getWeeklyAverage = () => {
        // Last 7 days including today? Or last completed week? 
        // "Weekly Completion % = Average of all Daily Completion % values within that week"
        // Let's take last 7 days for rolling window.
        let sum = 0;
        let daysWithData = 0;

        const checkDate = new Date();
        for (let i = 0; i < 7; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (history[dateStr]) {
                sum += getDailyCompletion(dateStr);
                daysWithData++;
            }
            checkDate.setDate(checkDate.getDate() - 1);
        }

        if (daysWithData === 0) return 0;
        return Math.round(sum / daysWithData);
    };

    const dailyVal = getDailyCompletion(today);
    const weeklyVal = getWeeklyAverage();
    const streakVal = calculateStreak();

    return (
        <div className="flex justify-between" style={{
            padding: '16px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)',
            border: '1px solid var(--border-color)'
        }}>
            <div className="flex flex-col items-center">
                <span className="text-muted text-sm">Today</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: dailyVal === 100 ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                    {dailyVal}%
                </span>
            </div>

            <div className="flex flex-col items-center" style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', flex: 1, margin: '0 15px' }}>
                <span className="text-muted text-sm">7-Day Avg</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {weeklyVal}%
                </span>
            </div>

            <div className="flex flex-col items-center">
                <span className="text-muted text-sm">Streak</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-warning)' }}>
                    {streakVal} <span style={{ fontSize: '0.8rem' }}>days</span>
                </span>
            </div>
        </div>
    );
};

export default StatsOverview;
