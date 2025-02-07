from app.services.course_service import CourseService
from flask import jsonify, request 

class CourseController:
    @staticmethod
    def get_courses():
        try:
            courses = CourseService.get_all_courses()
            return jsonify({"courses": courses})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @staticmethod
    def get_students_in_course():
        course_id = request.args.get('course_id')
        
        if not course_id:
            return jsonify({"error": "Missing course_id parameter"}), 400
        
        try:
            course_id = int(course_id)
        except ValueError:
            return jsonify({"error": "Invalid course_id parameter"}), 400
            
        try:
            students = CourseService.get_students_in_course(course_id)
            return jsonify({
                "course_id": course_id,
                "students": students
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @staticmethod
    def get_course_summary():
        course_id = request.args.get('course_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not all([course_id, start_date, end_date]):
            return jsonify({"error": "Missing required parameters"}), 400

        try:
            summary = CourseService.get_course_summary(course_id, start_date, end_date)
            print(summary)
            return jsonify({
                "success": True,
                "summary": summary["summary"],
                "data": summary["data"]
            })
        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
            
    @staticmethod
    def get_course_participations():
        course_id = request.args.get('course_id')

        if not all([course_id]):
            return jsonify({"error": "Missing required parameters"}), 400

        try:
            summary = CourseService.get_course_participations(course_id)
            return jsonify({
                "success": True,
                "summary": summary
            })
        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
            
    @staticmethod        
    def get_course_device_stats():
        course_id = request.args.get('course_id')
        if not course_id:
            return jsonify({"error": "Missing course_id parameter"}), 400
        
        try:
            course_id = int(course_id)
        except ValueError:
            return jsonify({"error": "Invalid course_id parameter"}), 400
        try:
            devicestats = CourseService.get_course_device_stats(course_id)
            return jsonify({
                "course_id": course_id,
                "devicestats": devicestats
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @staticmethod        
    def get_course_video_stats():
        course_id = request.args.get('course_id')
        if not course_id:
            return jsonify({"error": "Missing course_id parameter"}), 400
        
        try:
            course_id = int(course_id)
        except ValueError:
            return jsonify({"error": "Invalid course_id parameter"}), 400
            
        try:
            video_stats = CourseService.get_course_video_stats(course_id)
            return jsonify({
                "success": True,
                "data": video_stats
            })
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Error fetching video statistics: {str(e)}"
            }), 500
        
    
    @staticmethod        
    def get_course_discussion_stats():
        course_id = request.args.get('course_id')
        if not course_id:
            return jsonify({"error": "Missing course_id parameter"}), 400
        
        try:
            course_id = int(course_id)
        except ValueError:
            return jsonify({"error": "Invalid course_id parameter"}), 400
        try:
            discussionstats = CourseService.get_course_discussion_stats(course_id)
            return jsonify({
                "course_id": course_id,
                "students": discussionstats
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
        