import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CompareWeeklyActivity = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5001/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses))
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setError("Failed to fetch courses");
      });
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      fetch(`http://localhost:5001/api/students?course_id=${selectedCourse}`)
        .then((res) => res.json())
        .then((data) => {
          setStudents(data.students);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching students:", err);
          setLoading(false);
          setError("Failed to fetch students");
        });
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse && selectedStudents.length === 2) {
      setLoading(true);
      setError(null);
      fetch(
        `http://localhost:5001/api/detailed-weekly-activity?course_id=${selectedCourse}&student_ids=${selectedStudents.join(
          ","
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setComparisonData(data.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching comparison data:", err);
          setLoading(false);
          setError("Failed to fetch comparison data");
        });
    }
  }, [selectedCourse, selectedStudents]);
  const getOrdinalSuffix = (number) => {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return "th";
    }

    switch (lastDigit) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  const handleStudentSelect = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else if (selectedStudents.length < 2) {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const getStudentName = (studentId) => {
    const cleanId = studentId.toString().split('_')[0];
    const student = students.find(s => s.student_id.toString() === cleanId);
  
    return student ? `${cleanId}` : `${cleanId}`;
  };

  const prepareChartData = (data) => {
    if (!data || data.length !== 2) return [];
  
    const weekData = [];
    let weekNumber = 1;
  
    while (
      data[0][`week_${weekNumber}_views`] !== undefined ||
      data[1][`week_${weekNumber}_views`] !== undefined
    ) {
      weekData.push({
        week: weekNumber,
        [`Student ${data[0].student_id}_views`]: data[0][`week_${weekNumber}_views`] || 0,
        [`Student ${data[1].student_id}_views`]: data[1][`week_${weekNumber}_views`] || 0,
        [`Student ${data[0].student_id}_rank`]: data[0][`week_${weekNumber}_rank`] || 0,
        [`Student ${data[1].student_id}_rank`]: data[1][`week_${weekNumber}_rank`] || 0,
      });
      weekNumber++;
    }
  
    return weekData;
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Compare Student Activities
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Select two students to compare their engagement patterns
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedStudents([]);
                setComparisonData([]);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Two Students to Compare ({selectedStudents.length}/2
                selected)
              </label>
              <div className="mb-4">
                {selectedStudents.length > 0 && (
                  <div className="text-sm text-gray-600 mb-2">
                    Selected:{" "}
                    {selectedStudents
                      .map((id) => getStudentName(id))
                      .join(" vs ")}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {students.map((student) => (
                  <button
                    key={student.student_id} 
                    onClick={() => handleStudentSelect(student.student_id)}
                    className={`p-3 rounded-lg text-left ${
                      selectedStudents.includes(student.student_id)
                        ? "bg-blue-100 border-blue-500 border-2"
                        : "bg-gray-50 border border-gray-300 hover:bg-gray-100"
                    } ${
                      selectedStudents.length === 2 &&
                      !selectedStudents.includes(student.student_id)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      selectedStudents.length === 2 &&
                      !selectedStudents.includes(student.student_id)
                    }
                  >
                    <div className="font-medium">
                      {" "}
                      Student {student.student_id}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading comparison data...</p>
          </div>
        )}

        {comparisonData.length === 2 && !loading && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[250px]">
                      Metric
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Student {getStudentName(comparisonData[0].student_id)}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Student {getStudentName(comparisonData[1].student_id)}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    {
                      label: "Total Page Views",
                      key: "total_pageviews",
                      tooltip:
                        "Total number of course page visits throughout the semester",
                    },
                    {
                      label: "Active Days",
                      key: "active_days",
                      tooltip: "Number of days with at least one page view",
                    },
                    {
                      label: "Average Daily Views",
                      key: "avg_daily_views",
                      format: (val) => val.toFixed(2),
                      tooltip:
                        "Average number of page views on days with activity",
                    },
                    {
                      label: "Morning Activity",
                      key: "morning_pct",
                      format: (val) => val.toFixed(2) + "%",
                      tooltip: "Percentage of activity between 5 AM and 11 AM",
                    },
                    {
                      label: "Afternoon Activity",
                      key: "afternoon_pct",
                      format: (val) => val.toFixed(2) + "%",
                      tooltip: "Percentage of activity between 12 PM and 4 PM",
                    },
                    {
                      label: "Evening Activity",
                      key: "evening_pct",
                      format: (val) => val.toFixed(2) + "%",
                      tooltip: "Percentage of activity between 5 PM and 9 PM",
                    },
                    {
                      label: "Night Activity",
                      key: "night_pct",
                      format: (val) => val.toFixed(2) + "%",
                      tooltip: "Percentage of activity between 10 PM and 4 AM",
                    },
                  ].map(({ label, key, format, tooltip }) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <span>{label}</span>
                          <div className="relative inline-block group ml-1.5">
                            <div className="cursor-help">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                className="w-4 h-4 text-gray-400 hover:text-gray-500"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4M12 8h.01" />
                              </svg>
                            </div>
                            <div className="invisible group-hover:visible absolute z-50 text-sm bg-gray-800 text-white p-2 rounded-md shadow-lg -translate-y-1/2 left-6 whitespace-normal min-w-[200px] max-w-[250px]">
                              {tooltip}
                              <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {format
                          ? format(comparisonData[0][key])
                          : comparisonData[0][key]}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {format
                          ? format(comparisonData[1][key])
                          : comparisonData[1][key]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  Weekly Page Views Comparison
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Compare students' weekly engagement through page views
                </p>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepareChartData(comparisonData)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="week"
                      label={{
                        value: "Week Number",
                        position: "bottom",
                        offset: 0,
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      label={{
                        value: "Page Views",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle" },
                      }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 border rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-700 mb-2">
                                Week {label}
                              </p>
                              <div className="space-y-2">
                                {payload.map((entry, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center"
                                  >
                                    <div
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-gray-700">
                                      {getStudentName(entry.name.split("_")[0])}
                                      : {entry.value} views
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      content={({ payload }) => (
                        <div className="flex justify-center gap-6 mb-4">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-gray-600">
                                {getStudentName(entry.dataKey.split("_")[0])}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                    {/* In Page Views Chart */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey={`Student ${comparisonData[0].student_id}_views`}
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name={`Student ${comparisonData[0].student_id}`}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey={`Student ${comparisonData[1].student_id}_views`}
                      stroke="#F97316"
                      strokeWidth={2}
                      name={`Student ${comparisonData[1].student_id}`}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />

                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Higher peaks indicate increased activity</li>
                  <li>Missing data points indicate weeks with no activity</li>
                  <li>Hover over points to see exact values</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  Class Ranking Over Time
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Lower position indicates better rank (1 = top of class)
                </p>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepareChartData(comparisonData)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="week"
                      label={{
                        value: "Week Number",
                        position: "bottom",
                        offset: 0,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="left"
                      reversed={true}
                      domain={[1, "dataMax"]}
                      allowDecimals={false}
                      label={{
                        value: "Class Rank",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle" },
                      }}
                      tickFormatter={(value) =>
                        `${value}${getOrdinalSuffix(value)}`
                      }
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 border rounded-lg shadow-lg">
                              <p className="font-semibold text-gray-700 mb-2">
                                Week {label}
                              </p>
                              <div className="space-y-2">
                                {payload.map((entry, index) => {
                                  const rank = Math.round(entry.value);
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center"
                                    >
                                      <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: entry.color }}
                                      />
                                      <span className="text-gray-700">
                                        {getStudentName(
                                          entry.name.split("_")[0]
                                        )}
                                        : {rank}
                                        {getOrdinalSuffix(rank)} place
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      content={({ payload }) => (
                        <div className="flex justify-center gap-6 mb-4">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-gray-600">
                                {getStudentName(entry.dataKey.split("_")[0])}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey={`Student ${comparisonData[0].student_id}_rank`}
                    stroke="#22C55E"
                    strokeWidth={2}
                    name={`Student ${comparisonData[0].student_id}`}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey={`Student ${comparisonData[1].student_id}_rank`}
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name={`Student ${comparisonData[1].student_id}`}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                                    </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Rank 1 represents the top position in class</li>
                  <li>
                    Lower position on the graph indicates better performance
                  </li>
                  <li>Missing data points indicate weeks with no activity</li>
                </ul>
              </div>
            </div>

            {/* Gaps Comparison */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Activity Gaps Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {comparisonData.map((student) => (
                  <div key={student.student_id} className="space-y-4">
                    <h4 className="font-medium text-lg text-blue-600">
                      Student {getStudentName(student.student_id)}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Total 4+ Day Gaps
                        </p>
                        <p className="text-xl font-bold text-orange-600">
                          {student.total_gaps_4days}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Longest Gap</p>
                        <p className="text-xl font-bold text-red-600">
                          {student.longest_gap_days} days
                        </p>
                      </div>
                    </div>
                    {student.first_gap_start && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 space-y-2">
                          <div>
                            <span className="font-medium">
                              First Gap Start:
                            </span>{" "}
                            {student.first_gap_start}
                          </div>
                          <div>
                            <span className="font-medium">Last Gap End:</span>{" "}
                            {student.last_gap_end}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareWeeklyActivity;
