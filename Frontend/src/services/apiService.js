// const BASE_URL = 'http://localhost:5001/api';

// const fetchOptions = {
//   credentials: 'include',
//   headers: {
//     'Content-Type': 'application/json',
//   }
// };

// export const apiService = {
//   getCourses: async () => {
//     const response = await fetch(`${BASE_URL}/courses`, fetchOptions);
//     const data = await response.json();
//     return data.courses;
//   },

//   getStudents: async (courseId) => {
//     const response = await fetch(`${BASE_URL}/students?course_id=${courseId}`, fetchOptions);
//     const data = await response.json();
//     return data.students;
//   },

//   getWeeklyActivity: async (courseId, studentId) => {
//     const response = await fetch(
//       `${BASE_URL}/weekly-activity?course_id=${courseId}&student_id=${studentId}`, 
//       fetchOptions
//     );
//     const data = await response.json();
//     return data.week_wise_activity[0];
//   },

//   compareActivity: async (courseId, studentIds) => {
//     const response = await fetch(
//       `${BASE_URL}/compare-weekly-activity?course_id=${courseId}&student_ids=${studentIds}`, 
//       fetchOptions
//     );
//     const data = await response.json();
//     return data.comparison;
//   }
// };