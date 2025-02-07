import React, { useState, useEffect } from "react";

const Participations = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignmentData, setAssignmentData] = useState([]);
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
      fetch(
        `http://localhost:5001/api/course-participations?course_id=${selectedCourse}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.summary) {
            const groupedData = data.summary.reduce((acc, item) => {
           
              if (!acc[item.module_id]) {
                acc[item.module_id] = {
                  module_id: item.module_id,
                  module_name: item.module_name,
                  assignments: {},
                };
              }

              if (!acc[item.module_id].assignments[item.assignment_id]) {
                acc[item.module_id].assignments[item.assignment_id] = {
                  title: item.title,
                  on_time: 0,
                  floating: 0,
                  late: 0,
                };
              }
              acc[item.module_id].assignments[item.assignment_id][
                item.status.toLowerCase()
              ]++;

              return acc;
            }, {});

            const processedData = Object.entries(groupedData).map(
              ([moduleId, moduleData]) => ({
                module_id: moduleId,
                module_name: moduleData.module_name,
                assignments: Object.entries(moduleData.assignments).map(
                  ([assignId, assignData]) => ({
                    id: assignId,
                    ...assignData,
                  })
                ),
              })
            );

            setAssignmentData(processedData);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching assignment data:", err);
          setLoading(false);
        });
    }
  }, [selectedCourse]);

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Participations</h1>
          <p className="mt-2 text-lg text-gray-600">
            View assignment data by module
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={handleCourseChange}
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
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Assignment Data by Module
              </h3>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : assignmentData && assignmentData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Module/Assignment
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          On-Time
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Floating
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Late
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignmentData.map((module) => (
                        <React.Fragment key={module.module_id}>
  
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {module.module_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Module ID: {module.module_id}
                              </div>
                            </td>
                            <td colSpan="4" className="px-6 py-4"></td>
                          </tr>

                          {module.assignments.map((assignment) => {
                            const total =
                              assignment.on_time +
                              assignment.floating +
                              assignment.late;
                            return (
                              <tr
                                key={assignment.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 pl-12">
                                  <div className="text-sm text-gray-900">
                                    {assignment.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Assignment ID: {assignment.id}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {assignment.on_time}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    {assignment.floating}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    {assignment.late}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                                  {total}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No assignment data available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Participations;
