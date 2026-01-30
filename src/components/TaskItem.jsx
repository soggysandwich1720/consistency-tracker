import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';

const PriorityDot = ({ priority, isCompleted }) => {
    const color = {
        'High': 'var(--accent-error)',
        'Medium': 'var(--accent-warning)',
        'Low': '#2196F3' // Blue
    }[priority] || 'var(--text-muted)';

    return (
        <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block',
            marginLeft: '8px',
            opacity: isCompleted ? 0.3 : 0.8,
            transition: 'opacity 0.3s ease'
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
    const [isPressing, setIsPressing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const pressTimerRef = useRef(null);

    // Get current timer value from history
    const savedTime = history[today]?.timers?.[task.id] || 0;

    const handlePressStart = (e) => {
        if (isCompleted) return;
        // Don't trigger if clicking nested interaction elements
        if (e.target.closest('button')) return;

        setIsPressing(true);
        pressTimerRef.current = setTimeout(() => {
            setIsPressing(false);
            setShowSuccess(true);
            toggleTaskCompletion(task.id);
            // Hide success effect after a bit
            setTimeout(() => setShowSuccess(false), 2000);
        }, 1200);
    };

    const handlePressEnd = () => {
        setIsPressing(false);
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
    };

    return (
        <div
            className={`task-card ${isPressing ? 'pressing' : ''} ${isCompleted ? 'completed' : ''}`}
            onPointerDown={handlePressStart}
            onPointerUp={handlePressEnd}
            onPointerLeave={handlePressEnd}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onContextMenu={(e) => e.preventDefault()}
            style={{
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: (isCompleted || isPressing) ? '1.5px solid rgba(76, 175, 80, 0.4)' : '1.5px solid var(--border-color)',
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 16px',
                textAlign: 'center',
                boxShadow: (isCompleted || isPressing) ? 'var(--glow-success-subtle)' : '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
            }}
        >
            {/* SVG Progress Overlay (Clockwise Fill) */}
            {!isCompleted && (
                <svg className="border-progress-svg">
                    <rect
                        x="1" y="1"
                        rx="12"
                        className="progress-path"
                        pathLength="100"
                        style={{
                            width: 'calc(100% - 2px)',
                            height: 'calc(100% - 2px)',
                            strokeDasharray: '100',
                            strokeDashoffset: isPressing ? '0' : '100',
                            transition: isPressing
                                ? 'stroke-dashoffset 1.2s linear'
                                : 'stroke-dashoffset 0.15s ease-out'
                        }}
                    />
                </svg>
            )}

            {/* Delete button in top-right */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this routine?')) deleteTask(task.id);
                }}
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    color: 'var(--text-muted)',
                    fontSize: '1.2rem',
                    lineHeight: 1,
                    padding: '4px',
                    opacity: isCompleted ? 0.1 : 0.4,
                    visibility: (isHovered || isCompleted) ? 'visible' : 'hidden',
                    transition: 'opacity 0.2s',
                    zIndex: 25,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                }}
                title="Delete task"
            >
                &times;
            </button>

            {/* Success Tick Overlay */}
            {isCompleted && (
                <div className={`success-tick ${showSuccess ? 'success-tick-glow' : ''}`} style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 30, // Higher z-index to stay on top
                    opacity: 1, // Full opacity for "earned" state
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }}>
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="glossyGradient" cx="50%" cy="35%" r="50%" fx="50%" fy="35%">
                                <stop offset="0%" stopColor="#81C784" />
                                <stop offset="100%" stopColor="#388E3C" />
                            </radialGradient>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                                <feOffset dx="1" dy="2" result="offsetblur" />
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope="0.4" />
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Outer Ring */}
                        <circle cx="32" cy="32" r="28" stroke="url(#glossyGradient)" strokeWidth="5" filter="url(#shadow)" />
                        {/* Checkmark */}
                        <path
                            d="M18 32l10 10 20-20"
                            stroke="white"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#shadow)"
                            style={{
                                dropShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                stroke: '#ffffff'
                            }}
                        />
                        {/* Internal Glossy Circle (Subtle) */}
                        <circle cx="32" cy="32" r="28" fill="url(#glossyGradient)" fillOpacity="0.1" />
                    </svg>
                </div>
            )}

            <div className="flex flex-col items-center justify-center gap-sm" style={{
                width: '100%',
                opacity: isCompleted ? 0.3 : 1,
                transition: 'opacity 0.4s ease'
            }}>
                <div className="flex items-center justify-center gap-xs">
                    <span style={{
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        maxWidth: '100%',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.3'
                    }}>
                        {task.name}
                    </span>
                    <PriorityDot priority={task.priority} isCompleted={isCompleted} />
                </div>

                {task.scheduledTime && (
                    <div className="text-muted text-sm flex items-center gap-sm" style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                        ⏰ {task.scheduledTime}
                    </div>
                )}

                {task.hasTimer && (
                    <div style={{ marginTop: '8px', pointerEvents: isCompleted ? 'none' : 'auto' }}>
                        <Timer taskId={task.id} initialSeconds={savedTime} />
                    </div>
                )}
            </div>
        </div >
    );
};

export default TaskItem;
