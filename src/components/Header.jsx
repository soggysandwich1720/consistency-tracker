import React, { useState } from 'react';
import { formatDateDisplay, getTodayDateString } from '../utils/dateUtils';
import HistoryModal from './HistoryModal';

const Header = () => {
    const today = getTodayDateString();
    const displayDate = formatDateDisplay(today);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    return (
        <>
            <header className="flex flex-col gap-sm" style={{ marginBottom: 'var(--spacing-xl)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-md)' }}>
                <div className="flex justify-between items-center">
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Daily Checklist</h1>
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        style={{
                            padding: '6px',
                            color: 'var(--text-muted)',
                            background: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.2s ease'
                        }}
                        title="View History"
                        className="hover-scale"
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            border: '2px solid currentColor',
                            borderRadius: '4px',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: '6px'
                        }}>
                            {/* Calendar Header Bar */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '6px',
                                background: 'currentColor',
                                borderRadius: '1px 1px 0 0'
                            }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                                {new Date().getDate()}
                            </span>
                        </div>
                    </button>
                </div>
                <div className="text-muted text-sm flex justify-between items-center">
                    <span>{displayDate}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>CONSISTENCY TRACKER</span>
                </div>
            </header>

            {isHistoryOpen && <HistoryModal onClose={() => setIsHistoryOpen(false)} />}
        </>
    );
};

export default Header;
