# app/routes/course_routes.py
from flask import Blueprint
from app.controllers.course_controller import CourseController

course_bp = Blueprint('courses', __name__)

@course_bp.route('/api/courses', methods=['GET'])
def get_courses():
    return CourseController.get_courses()

@course_bp.route('/api/students', methods=['GET'])
def get_students():
    return CourseController.get_students_in_course()

@course_bp.route('/api/course-summary', methods=['GET'])
def get_course_summary():
    return CourseController.get_course_summary()

@course_bp.route('/api/course-participations', methods=['GET'])
def get_course_participations():
    return CourseController.get_course_participations()

@course_bp.route('/api/course-device-stats', methods=['GET'])
def get_course_device_stats():
    return CourseController.get_course_device_stats()

@course_bp.route('/api/course-video-stats', methods=['GET'])
def get_course_video_stats():
    return CourseController.get_course_video_stats()

@course_bp.route('/api/course-discussion-stats', methods=['GET'])
def get_course_discussion_stats():
    return CourseController.get_course_discussion_stats()