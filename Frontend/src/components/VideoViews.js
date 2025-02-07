import React from 'react';
import {
    ResponsiveContainer,
    Legend,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';


const VideoViews = ({ videoStats }) => {
    if (!videoStats || !videoStats.top_videos) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Video Analytics</h3>
                <div className="text-center text-gray-500 py-4">
                    No video data available for this course.
                </div>
            </div>
        );
    }

    const { overview, top_videos } = videoStats;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Video Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Videos</div>
                    <div className="text-2xl font-bold text-gray-900">{overview.total_videos}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Plays</div>
                    <div className="text-2xl font-bold text-gray-900">{overview.total_plays}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Avg. Completion</div>
                    <div className="text-2xl font-bold text-gray-900">{overview.avg_completion_rate}%</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Hours Viewed</div>
                    <div className="text-2xl font-bold text-gray-900">{overview.total_hours_viewed}</div>
                </div>
            </div>

            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top_videos}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="title" 
                            angle={-45} 
                            textAnchor="end" 
                            height={80} 
                            interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar name="Play count" dataKey="views" fill="#2563eb" />
                        <Bar name="Unique Viewers" dataKey="unique_viewers" fill="#10b981" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default VideoViews;