import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useTasks } from '../context/TaskContext';

const AnalyticsCharts = () => {
    const { history, today } = useTasks();

    const data = useMemo(() => {
        const dailyData = [];
        const monthlyData = [];

        // --- Weekly Chart Data (Last 4 Days) ---
        // User requested "fetch last four days"
        for (let i = 3; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const entry = history[dateStr];

            let percentage = 0;
            if (entry && entry.assigned && entry.assigned.length > 0) {
                percentage = Math.round((entry.completed.length / entry.assigned.length) * 100);
            }

            dailyData.push({
                date: dateStr.slice(5), // mm-dd
                completion: percentage
            });
        }

        // --- Monthly Chart Data (Last 4 Weeks) ---
        // User requested "last four weeks data"
        // We group by 7 day chunks backwards
        for (let w = 3; w >= 0; w--) {
            let sum = 0;
            let count = 0;

            // Start date of this week chunk
            // w=0 means current week (0-6 days ago)
            // w=1 means (7-13 days ago)
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (w * 7));

            for (let d = 0; d < 7; d++) {
                const current = new Date(weekStart);
                current.setDate(current.getDate() - d);
                const dateStr = current.toISOString().split('T')[0];
                const entry = history[dateStr];

                if (entry && entry.assigned && entry.assigned.length > 0) {
                    sum += (entry.completed.length / entry.assigned.length) * 100;
                    count++;
                }
            }

            monthlyData.push({
                week: `W${4 - w}`, // W1, W2, W3, W4 (chronological)
                avg: count > 0 ? Math.round(sum / count) : 0
            });
        }

        return { dailyData, monthlyData };
    }, [history, today]); // Recalc when history changes

    const ChartContainer = ({ title, children }) => (
        <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            border: '1px solid var(--border-color)',
            height: '250px'
        }}>
            <h3 className="text-sm text-muted" style={{ marginBottom: '16px', textTransform: 'uppercase' }}>{title}</h3>
            <div style={{ width: '100%', height: 'calc(100% - 30px)' }}>
                {children}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col">
            <ChartContainer title="Weekly Progress (Last 4 Days)">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px' }}
                        />
                        <Bar
                            dataKey="completion"
                            fill="var(--text-primary)"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Monthly Progress (Last 4 Weeks)">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '4px' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="avg"
                            stroke="var(--accent-success)"
                            strokeWidth={2}
                            dot={{ fill: '#121212', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
};

export default AnalyticsCharts;
