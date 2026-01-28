import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';

const StatsOverview = () => {
    const { history, today, consistencyScore, calculateAverage, calculateCurrentStreak } = useTasks();
    const [animatedScore, setAnimatedScore] = useState(0);

    // Initial animation for the score and ring
    useEffect(() => {
        let startTime;
        const duration = 2000; // Increased to 2s for smoother transition
        const startValue = 0;
        const endValue = consistencyScore;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function: easeOutQuart (starts fast, slows down)
            const easeProgress = 1 - Math.pow(1 - progress, 4);

            // Keep as float for smoother calculation of the ring offset
            const currentVal = startValue + easeProgress * (endValue - startValue);
            setAnimatedScore(currentVal);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [consistencyScore]);

    const getDailyCompletion = (date) => {
        const entry = history[date];
        if (!entry || !entry.assigned || entry.assigned.length === 0) return 0;
        return Math.round((entry.completed.length / entry.assigned.length) * 100);
    };

    const dailyVal = getDailyCompletion(today);
    const weeklyVal = calculateAverage(7);
    const streakVal = calculateCurrentStreak();

    // SVG parameters
    const size = 160;
    const strokeWidth = 8; // Increased from 3 to 8 for a thicker look
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    // Use the float animatedScore for the offset calculation
    const offset = circumference - (animatedScore / 100) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            {/* Minimalistic Consistency Score Card */}
            <div style={{
                padding: '32px 24px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                        {/* Background Circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke="var(--border-color)"
                            strokeWidth={strokeWidth}
                            opacity="0.2"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke="var(--accent-success)" // Changed to green
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ transition: 'none' }}
                        />
                    </svg>
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: '300', color: 'var(--text-primary)', lineHeight: 1 }}>
                                {Math.round(animatedScore)}
                            </span>
                            <span style={{ fontSize: '1.25rem', fontWeight: '300', color: 'var(--text-secondary)', marginLeft: '2px' }}>
                                %
                            </span>
                        </div>
                    </div>
                </div>
                <span className="text-muted" style={{ marginTop: '16px', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                    Consistency
                </span>
            </div>

            {/* Subtle Stats Row */}
            <div className="flex justify-between" style={{
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
            }}>
                <div className="flex flex-col items-center" style={{ flex: 1 }}>
                    <span className="text-muted text-xs uppercase tracking-tight">Today</span>
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: dailyVal === 100 ? 'var(--accent-success)' : 'var(--text-secondary)' }}>
                        {dailyVal}%
                    </span>
                </div>

                <div className="flex flex-col items-center" style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', flex: 1 }}>
                    <span className="text-muted text-xs uppercase tracking-tight">7d Average</span>
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {weeklyVal}%
                    </span>
                </div>

                <div className="flex flex-col items-center" style={{ flex: 1 }}>
                    <span className="text-muted text-xs uppercase tracking-tight">Streak</span>
                    <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--accent-warning)' }}>
                        {streakVal} <span style={{ fontSize: '0.7rem', fontWeight: '400' }}>days</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StatsOverview;
