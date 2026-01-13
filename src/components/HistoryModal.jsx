import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { getTodayDateString } from '../utils/dateUtils';

const HistoryModal = ({ onClose }) => {
    const { history } = useTasks();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStats, setSelectedDateStats] = useState(null);

    // Helper: Get % for a specific YYYY-MM-DD
    const getCompletionForDate = (dateStr) => {
        const entry = history[dateStr];
        if (!entry || !entry.assigned || entry.assigned.length === 0) return null; // No data
        return Math.round((entry.completed.length / entry.assigned.length) * 100);
    };

    // Generate Calendar Grid
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // adjust for start day (0=Sunday, 1=Monday... lets map to Mon=0 start for "work" feel? Or standard Sun=0)
        // Standard Sun=0 is fine.
        const startDayOfWeek = firstDayOfMonth.getDay();

        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        // Actual days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            // format YYYY-MM-DD manually to match history keys safely (local time)
            // Note: ISOString uses UTC. We want local YYYY-MM-DD.
            // Quick local format:
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dayStr = String(dateObj.getDate()).padStart(2, '0');
            const isoDate = `${y}-${m}-${dayStr}`;

            days.push({
                day: d,
                dateStr: isoDate,
                score: getCompletionForDate(isoDate)
            });
        }

        return days;
    }, [currentDate, history]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDateStats(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDateStats(null);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-secondary)',
                width: '90%', // Responsive
                maxWidth: '380px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                maxHeight: '90vh', // Prevent overflow on small landscape
                display: 'flex',
                flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <button onClick={handlePrevMonth} style={{ fontSize: '1.2rem', padding: '0 8px' }}>&lsaquo;</button>
                    <span style={{ fontWeight: 600 }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                    <button onClick={handleNextMonth} style={{ fontSize: '1.2rem', padding: '0 8px' }}>&rsaquo;</button>
                </div>

                {/* Calendar Grid */}
                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px', textAlign: 'center' }}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="text-muted text-sm">{d}</span>)}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
                        {calendarData.map((day, idx) => {
                            if (!day) return <div key={idx} />;

                            // Determine color based on score
                            let bg = 'transparent';
                            let border = '1px solid var(--border-color)';
                            let color = 'var(--text-primary)';

                            if (day.score !== null) {
                                border = 'none';
                                // Opacity mapping
                                // <50% = red/orangeish
                                // >50% = teal/green
                                if (day.score === 100) {
                                    bg = 'var(--accent-success)';
                                    color = '#000';
                                } else if (day.score >= 50) {
                                    bg = `rgba(76, 175, 80, ${0.4 + (day.score / 200)})`; // 0.4 to 0.9 opacity
                                } else if (day.score > 0) {
                                    bg = `rgba(255, 193, 7, ${0.4 + (day.score / 200)})`; // Yellowish
                                } else {
                                    bg = 'rgba(255, 82, 82, 0.3)'; // Red
                                }
                            }

                            // Today highlight
                            const isToday = day.dateStr === getTodayDateString();

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDateStats({ date: day.dateStr, score: day.score })}
                                    style={{
                                        aspectRatio: '1/1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        fontSize: '0.875rem',
                                        background: bg,
                                        border: isToday ? '1px solid var(--accent-primary)' : border,
                                        color: color,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {day.day}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer / Details */}
                <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', minHeight: '60px' }}>
                    {selectedDateStats ? (
                        <div className="text-center">
                            <div className="text-sm text-muted">{selectedDateStats.date}</div>
                            {selectedDateStats.score !== null ? (
                                <div>
                                    You completed <strong style={{ color: 'var(--accent-success)' }}>{selectedDateStats.score}%</strong> of tasks.
                                </div>
                            ) : (
                                <div className="text-muted">No data recorded.</div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-muted text-sm">
                            Select a date to view details
                        </div>
                    )}
                </div>

                <button onClick={onClose} style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default HistoryModal;
