import React, { useState, useEffect } from 'react';
import DeviceDistribution from "./DeviceDistribution";
import DiscussionStats from "./DiscussionStats";
import VideoViews from "./VideoViews";

const OtherActivity = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [deviceStats, setDeviceStats] = useState([]);
    const [videoStats, setVideoStats] = useState([]);
    const [discussionStats, setDiscussionStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5001/api/courses")
            .then((res) => res.json())
            .then((data) => setCourses(data.courses))
            .catch(() => setError("Failed to fetch courses"));
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            setLoading(true);
            Promise.all([
                fetch(`http://localhost:5001/api/course-device-stats?course_id=${selectedCourse}`),
                fetch(`http://localhost:5001/api/course-video-stats?course_id=${selectedCourse}`),
                fetch(`http://localhost:5001/api/course-discussion-stats?course_id=${selectedCourse}`)
            ])
                .then(async ([deviceRes, videoRes, discussionRes]) => {
                    const deviceData = await deviceRes.json();
                    const videoData = await videoRes.json();
                    const discussionData = await discussionRes.json();
    
                    console.log('Device Data:', deviceData); 
                    
                    setDeviceStats(deviceData.devicestats);
                    if (videoData.success) setVideoStats(videoData.data);
                    if (discussionData.success) setDiscussionStats(discussionData.data);
                })
                .catch(err => {
                    console.error('Error fetching data:', err);
                    setError('Failed to fetch activity data');
                })
                .finally(() => setLoading(false));
        }
    }, [selectedCourse]);

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Course Activity</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        View detailed activity statistics
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Course
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a course...</option>
                            {courses.map((course) => (
                                <option key={course.course_id} value={course.course_id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCourse && (
                        <div className="mt-8 space-y-6">
                            {loading ? (
                                <div className="text-center py-4">Loading...</div>
                            ) : error ? (
                                <div className="bg-red-50 p-4 rounded-lg text-red-600">{error}</div>
                            ) : (
                                <>
                                    <DeviceDistribution deviceStats={deviceStats} />
                                    <VideoViews videoStats={videoStats} />
                                    <DiscussionStats discussionStats={discussionStats} />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OtherActivity;