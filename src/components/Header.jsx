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
                        style={{ padding: '8px', color: 'var(--text-muted)' }}
                        title="View History"
                    >
                        <span style={{ fontSize: '1.2rem' }}>📅</span>
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
