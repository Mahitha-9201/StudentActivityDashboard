import React, { useState, useEffect } from "react";
import Timeline from "./Timeline";

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5001/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses))
      .catch(() => setError("Failed to fetch courses"));
  }, []);

  const parseDailyData = (summary) => {
    if (!summary) return { topDays: [], bottomDays: [] };

    try {
      const topSection = summary
        .split("Top 5 Page View Days:")[1]
        ?.split("Bottom 5 Page View Days:")[0];
      const bottomSection = summary
        .split("Bottom 5 Page View Days:")[1]
        ?.split("Weekly Patterns:")[0];

      const parseSection = (section) => {
        if (!section) return [];
        return section
          .split("\n")
          .filter((line) => line.trim() && line.includes("views)"))
          .map((line) => {
            const match = line.match(/- (.*?) \((\d+) views\)/);
            if (!match) return null;
            return {
              date: match[1],
              views: parseInt(match[2]),
            };
          })
          .filter((item) => item !== null);
      };

      return {
        topDays: parseSection(topSection),
        bottomDays: parseSection(bottomSection),
      };
    } catch (error) {
      console.error("Error parsing daily data:", error);
      return { topDays: [], bottomDays: [] };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !startDate || !endDate) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Making request with:", {
        course_id: selectedCourse,
        start_date: startDate,
        end_date: endDate,
      });

      const response = await fetch(
        `http://localhost:5001/api/course-summary?course_id=${selectedCourse}&start_date=${startDate}&end_date=${endDate}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.summary) {
        setSummary(data.summary);
        if (data.data) {
          setChartData(data.data);
        }
      } else {
        console.error("Invalid response structure:", data);
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Detailed error:", err);
      setError(`Failed to fetch summary: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Course Summary</h1>
          <p className="mt-2 text-sm text-gray-600">
            View course activity patterns and insights
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSummary("");
                  setError(null);
                }}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {selectedCourse && (
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                 ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loading ? "Generating Summary..." : "Generate Summary"}
              </button>
            )}
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-8 text-center py-12">
              <p className="text-gray-600">Generating course summary...</p>
            </div>
          )}

          {summary && !loading && (
            <div className="mt-8 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Course Activity Analysis
                </h2>

                <div className="mb-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      {
                        label: "Total Views",
                        value: chartData?.overview?.total_views || 0,
                      },
                      {
                        label: "Unique Users",
                        value: chartData?.overview?.unique_users || 0,
                      },
                      {
                        label: "Active Days",
                        value: chartData?.overview?.active_days || 0,
                      },
                      {
                        label: "Avg Views/Day",
                        value:
                          chartData?.overview?.avg_views_per_day?.toFixed(2) ||
                          0,
                      },
                      {
                        label: "Peak Day Views",
                        value: Math.max(...(chartData?.daily?.views || [0])),
                      },
                    ].map((stat, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500">
                          {stat.label}
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            stat.indicator
                              ? parseFloat(stat.value) > 50
                                ? "text-green-600"
                                : "text-yellow-600"
                              : "text-gray-900"
                          }`}
                        >
                          {typeof stat.value === "number"
                            ? stat.value.toLocaleString()
                            : stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Daily Activity Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h4 className="text-md font-semibold text-green-700 mb-4">
                        Top 5 Most Active Days
                      </h4>
                      <div className="space-y-3">
                        {chartData?.daily?.dates
                          .map((date, index) => ({
                            date: new Date(date).toLocaleDateString("en-US", {
                              month: "numeric",
                              day: "numeric",
                            }),
                            views: chartData.daily.views[index],
                          }))
                          .sort((a, b) => b.views - a.views)
                          .slice(0, 5)
                          .map((day, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-green-50 p-3 rounded"
                            >
                              <span className="font-medium text-gray-800">
                                {day.date}
                              </span>
                              <span className="text-green-600 font-semibold">
                                {day.views} views
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                      <h4 className="text-md font-semibold text-red-700 mb-4">
                        Bottom 5 Least Active Days
                      </h4>
                      <div className="space-y-3">
                        {parseDailyData(summary)?.bottomDays?.map(
                          (day, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-red-50 p-3 rounded"
                            >
                              <span className="font-medium text-gray-800">
                                {day.date}
                              </span>
                              <span className="text-red-600 font-semibold">
                                {day.views} views
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
    
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Peak Hours
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {(chartData?.hourly?.hours || []) 
                      .slice(0, 5)
                      .map((hour, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="font-semibold text-gray-800">
                            {hour.formatted_hour}
                          </div>
                          <div className="mt-2">
                            <div className="text-2xl font-bold text-blue-600">
                              {hour.views}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {hour.percentage.toFixed(1)}% of total
                            </div>
                            <div className="text-sm text-gray-600">
                              {hour.avg_daily_views} views/day
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>


                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {(chartData?.hourly?.periods || []).map((period, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg border"
                      >
                        <div className="font-semibold text-gray-800 mb-2">
                          {period.period}
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {period.views} views
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                            <div
                              style={{ width: `${period.percentage}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                            ></div>
                          </div>
                          <div className="text-right text-sm text-gray-600 mt-1">
                            {period.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <Timeline
                    chartData={chartData}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
