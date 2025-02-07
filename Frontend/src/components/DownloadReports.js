import React, { useState, useEffect } from 'react';

const DownloadReports = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data.courses))
      .catch(() => setError('Failed to fetch courses'));
  }, []);

  const handleDownload = async () => {
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDownloadStatus('Preparing download...');
      
      window.location.href = `http://localhost:5001/api/download-report?course_id=${selectedCourse}`;
      
      setDownloadStatus('Download started!');
      
      setTimeout(() => {
        setDownloadStatus('');
      }, 3000);

    } catch (err) {
      setError('Failed to download report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Download Activity Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Download detailed student activity data for entire courses
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setError(null);
                  setDownloadStatus('');
                }}
                className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">Select a course...</option>
                {courses.map(course => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={!selectedCourse || loading}
                className={`px-4 py-2 rounded-md text-white font-medium flex items-center
                  ${!selectedCourse || loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                <svg
                  className={`mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {loading ? (
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                  ) : (
                    <path
                      fill="currentColor"
                      d="M9 3v2H5v14h14v-4h2v6H3V3h6zm12 0v8h-2V5.41l-7.29 7.3-1.42-1.42L17.59 4H13V2h8z"
                    />
                  )}
                </svg>
                {loading ? 'Preparing Download...' : 'Download Report'}
              </button>

              {error && (
                <div className="text-red-600 text-sm flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                  </svg>
                  {error}
                </div>
              )}

              {downloadStatus && !error && (
                <div className="text-green-600 text-sm flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                  {downloadStatus}
                </div>
              )}
            </div>

            {/* Report Information */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">About the Report</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="mb-2">The downloaded CSV report includes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Total page views and activity metrics</li>
                  <li>Weekly engagement data</li>
                  <li>Time distribution analysis</li>
                  <li>Activity gaps information</li>
                  <li>Student rankings and comparisons</li>
                </ul>
                <p className="mt-4 text-xs text-gray-500">
                  Note: Download time may vary based on course size and data volume.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadReports;