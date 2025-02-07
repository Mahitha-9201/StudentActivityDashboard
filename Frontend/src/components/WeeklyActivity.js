import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeeklyActivity = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5001/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data.courses))
      .catch(err => console.error('Error fetching courses:', err));
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      fetch(`http://localhost:5001/api/students?course_id=${selectedCourse}`)
        .then(res => res.json())
        .then(data => {
          setStudents(data.students);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching students:', err);
          setLoading(false);
        });
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse && selectedStudent) {
      setLoading(true);
      fetch(`http://localhost:5001/api/detailed-weekly-activity?course_id=${selectedCourse}&student_ids=${selectedStudent}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.length > 0) {
            setActivityData(data.data[0]);  
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching detailed activity data:', err);
          setLoading(false);
        });
    }
  }, [selectedCourse, selectedStudent]);

  const prepareChartData = (data) => {
    if (!data) return [];

    const weekData = [];
    let weekNumber = 1;

    while (data[`week_${weekNumber}_views`] !== undefined) {
      weekData.push({
        week: weekNumber,
        views: data[`week_${weekNumber}_views`],
        pctChange: data[`week_${weekNumber}_pct_change`] || 0,
        rank: data[`week_${weekNumber}_rank`] || 0
      });
      weekNumber++;
    }

    return weekData;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Weekly Activity Analysis</h1>
          <p className="mt-2 text-sm text-gray-600">Detailed view of student engagement over time</p>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedStudent('');
                  setActivityData(null);
                }}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a course...</option>
                {courses.map(course => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a student...</option>
                {students.map((student, index) => (
                  <option 
                    key={student.student_id} 
                    value={student.student_id} 
                  >
                 Student { student.student_id   }
                  </option>
                ))}
              </select>
            </div>
          )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading activity data...</p>
          </div>
        )}

        {activityData && !loading && (
          <div className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Overall Engagement</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Page Views</p>
                    <p className="text-2xl font-bold text-blue-600">{activityData.total_pageviews}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Days / Total Days</p>
                    <p className="text-xl font-semibold">
                      {activityData.active_days} / {activityData.total_days}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Daily Activity</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Average Views</p>
                    <p className="text-xl font-semibold">{activityData.avg_daily_views?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Views</p>
                    <p className="text-xl font-semibold">{activityData.max_daily_views}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Min Views</p>
                    <p className="text-xl font-semibold">{activityData.min_daily_views}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Time Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Morning</span>
                    <span className="font-semibold">{(activityData.morning_pct || 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Afternoon</span>
                    <span className="font-semibold">{(activityData.afternoon_pct || 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Evening</span>
                    <span className="font-semibold">{(activityData.evening_pct || 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Night</span>
                    <span className="font-semibold">{(activityData.night_pct || 0).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Activity Trends</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData(activityData)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#2563eb" name="Page Views" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Activity Gaps</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Total 4+ Day Gaps</p>
                  <p className="text-2xl font-bold text-orange-600">{activityData.total_gaps_4days}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Longest Gap</p>
                  <p className="text-2xl font-bold text-red-600">{activityData.longest_gap_days} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Gap Days</p>
                  <p className="text-2xl font-bold">{activityData.total_gap_days}</p>
                </div>
              </div>
              {activityData.first_gap_start && (
                <div className="mt-4 text-sm text-gray-600">
                  First Gap Start: {activityData.first_gap_start} , Last Gap End : {activityData.last_gap_end}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyActivity;