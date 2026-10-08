import React, { useState, useRef, useCallback } from 'react';

/**
 * A generic log panel that renders a list of timestamped entries.
 * Exposes an `addEntry` function (via ref) so parent components can
 * push log entries programmatically. Functionality will be wired later.
 */
const LogPanel = React.forwardRef(({ title, accentColor = '#0078d4' }, ref) => {
    const [entries, setEntries] = useState([]);

    /**
     * Add a log entry. Accepts a message and an optional level
     * ('info' | 'success' | 'warning' | 'error').
     */
    const addEntry = useCallback((message, level = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setEntries((prev) => [...prev, { id: prev.length, timestamp, message, level }]);
    }, []);

    const clearEntries = useCallback(() => setEntries([]), []);

    // Expose the log API to the parent via ref
    React.useImperativeHandle(ref, () => ({ addEntry, clearEntries }));

    const levelColors = {
        info: '#444',
        success: '#107c10',
        warning: '#ffb900',
        error: '#d13438'
    };

    return (
        <div style={{
            border: '1px solid #ddd',
            borderRadius: 6,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#fff',
            boxSizing: 'border-box'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #eee',
                paddingBottom: 8,
                marginBottom: 8
            }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#333', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: accentColor
                    }}/>
                    {title}
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>{entries.length} entries</div>
            </div>

            {/* Log entries */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 40,
                fontFamily: 'Consolas, "Courier New", monospace',
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.9
            }}>
                {entries.length === 0 ? (
                    <div style={{ color: '#aaa', fontStyle: 'italic', padding: '10px 4px' }}>
                        No entries logged yet.
                    </div>
                ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {entries.map((entry) => (
                            <li key={entry.id} style={{
                                borderBottom: '1px solid #f2f2f2',
                                padding: '5px 6px',
                                display: 'flex',
                                gap: 8
                            }}>
                                <span style={{ color: '#999' }}>[{entry.timestamp}]</span>
                                <span style={{
                                    color: levelColors[entry.level] || levelColors.info,
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-line'
                                }}>{entry.message}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
});

export default LogPanel;