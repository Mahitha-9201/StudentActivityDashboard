# Student Analytics Dashboard and Data Storage System

## Overview
This project is an end-to-end application that tracks, stores, and analyzes student activity data from an LMS (e.g., Canvas). It includes a robust SQL backend, REST APIs for data handling, and an analytics dashboard to visualize both high-level course trends and granular, student-specific engagement data.

---

## Features
- **Backend:** SQL database for secure and scalable data storage.
- **REST API Layer:** CRUD operations to manage activity data efficiently.
- **Dashboard:** Interactive data visualization for faculty and admins.
- **Granular Insights:** Tracks data at both course and student levels, such as:
  - Time spent on modules, pages, and discussions
  - Individual student engagement and activity patterns
  - Comparative analysis across students and modules
- **Reporting:** Generates custom reports to support informed decision-making.

---

## Technologies Used
- **Backend:** Python (Flask), RESTful APIs
- **Database:** SQL (PostgreSQL/MySQL/SQL Server)
- **Frontend:** React.js, Tailwind CSS, with data visualization (Chart.js, Recharts)
- **API Integration:** LMS(Blackboard, Canvas) REST API
- **Data Import/Export:** Supports bulk data operations via CSV or JSON

---

## Setup Instructions

### Prerequisites
Ensure the following are installed:
- Python 3.9+
- SQL database (PostgreSQL, MySQL, or SQL Server)
- Pipenv or virtualenv (for Python dependency management)
- Node.js and npm (for frontend development)
- Docker (optional, for containerized deployment)


## License
This project is licensed under the MIT License.

