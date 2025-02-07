import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';

const DeviceDistribution = ({ deviceStats }) => {
    console.log('DeviceStats in component:', deviceStats); 

    if (!deviceStats || !Array.isArray(deviceStats) || deviceStats.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Device Distribution</h3>
                <div className="text-center text-gray-500 py-4">
                    No device data available for this course.
                </div>
            </div>
        );
    }

    const COLORS = {
        Desktop: '#2563eb',
        Mobile: '#10b981',
        Tablet: '#f59e0b',
        App: '#8b5cf6',
        Other: '#6b7280'
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Device Distribution</h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={deviceStats}
                            dataKey="count"
                            nameKey="device_type"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({device_type, percentage}) => `${device_type} (${percentage}%)`}
                        >
                            {deviceStats.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[entry.device_type] || COLORS.Other} 
                                />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Count']} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 text-sm text-gray-500">
                {deviceStats.map((stat, index) => (
                    <div key={index}>
                        {stat.device_type}: {stat.count} ({stat.percentage}%)
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeviceDistribution;