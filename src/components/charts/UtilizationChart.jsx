import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Speech', capacity: 100, utilized: 92 },
    { name: 'Occupational', capacity: 80, utilized: 75 },
    { name: 'ABA', capacity: 120, utilized: 110 }, // Overbooked
    { name: 'Physical', capacity: 60, utilized: 40 },
];

const UtilizationChart = () => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300} minWidth={0} debounce={50}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }} width={100} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="utilized" name="Hours Booked" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="capacity" name="Total Capacity" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default UtilizationChart;
