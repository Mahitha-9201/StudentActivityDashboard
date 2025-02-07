import React from 'react';

const StudentDropdown = ({ students, onSelectStudent }) => {
    return (
        <div>
            <label>Select Student:</label>
            <select onChange={(e) => onSelectStudent(e.target.value)}>
                <option value="">-- Select a Student --</option>
                {students.map((student, index) => (
                    <option 
                        key={student.student_id} 
                        value={student.student_id}
                    >
                        {student.student_id}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default StudentDropdown;