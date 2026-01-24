import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { month: 'Jan', active: 30, waitlist: 5 },
    { month: 'Feb', active: 35, waitlist: 8 },
    { month: 'Mar', active: 38, waitlist: 10 },
    { month: 'Apr', active: 40, waitlist: 12 },
    { month: 'May', active: 42, waitlist: 15 },
    { month: 'Jun', active: 45, waitlist: 8 }, // Intake cleared
];

const OccupancyChart = () => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300} minWidth={0} debounce={50}>
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="waitlist" stackId="1" stroke="#fca5a5" fill="#fee2e2" name="Waitlist" />
                    <Area type="monotone" dataKey="active" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} name="Active Patients" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OccupancyChart;
