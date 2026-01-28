import React from 'react';
import { useTasks } from '../context/TaskContext';

const StatsOverview = () => {
    const { history, today, consistencyScore, calculateAverage, calculateCurrentStreak } = useTasks();

    const getDailyCompletion = (date) => {
        const entry = history[date];
        if (!entry || !entry.assigned || entry.assigned.length === 0) return 0;
        return Math.round((entry.completed.length / entry.assigned.length) * 100);
    };

    const getScoreTier = (score) => {
        if (score >= 95) return { label: 'Legendary', color: '#FFD700' };
        if (score >= 81) return { label: 'Elite', color: 'var(--accent-success)' };
        if (score >= 61) return { label: 'Solid', color: '#4FC3F7' };
        if (score >= 31) return { label: 'Building', color: 'var(--accent-warning)' };
        return { label: 'Starting Out', color: 'var(--text-muted)' };
    };

    const dailyVal = getDailyCompletion(today);
    const weeklyVal = calculateAverage(7);
    const streakVal = calculateCurrentStreak();
    const tier = getScoreTier(consistencyScore);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            {/* Consistency Score Card */}
            <div style={{
                padding: '24px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: tier.color }}></div>
                <span className="text-muted text-sm uppercase tracking-wider" style={{ marginBottom: '8px' }}>Consistency Score</span>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: tier.color, lineHeight: 1 }}>{consistencyScore}</div>
                <div style={{
                    marginTop: '12px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: `${tier.color}20`,
                    color: tier.color,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {tier.label}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="flex justify-between" style={{
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
            }}>
                <div className="flex flex-col items-center" style={{ flex: 1 }}>
                    <span className="text-muted text-sm">Today</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: dailyVal === 100 ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                        {dailyVal}%
                    </span>
                </div>

                <div className="flex flex-col items-center" style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', flex: 1 }}>
                    <span className="text-muted text-sm">7-Day Avg</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                        {weeklyVal}%
                    </span>
                </div>

                <div className="flex flex-col items-center" style={{ flex: 1 }}>
                    <span className="text-muted text-sm">Streak</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-warning)' }}>
                        {streakVal} <span style={{ fontSize: '0.75rem', fontWeight: '400' }}>days</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StatsOverview;
