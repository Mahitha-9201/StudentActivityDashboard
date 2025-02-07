from flask import jsonify, request, Response
import pandas as pd
from app.database.connection import Database
from datetime import datetime, timedelta
from app.services.course_service import CourseService
from app.services.activity_service import ActivityService

class ActivityController:
    @staticmethod
    def get_detailed_weekly_activity():
        course_id = request.args.get('course_id')
        student_ids = request.args.get('student_ids')

        if not course_id:
            return jsonify({"error": "Missing course_id parameter"}), 400
        
        if not student_ids:
            return jsonify({"error": "Missing student_ids parameter"}), 400

        try:
            data = ActivityService.get_detailed_weekly_activity(course_id, student_ids)
            return jsonify({
                "success": True,
                "course_id": course_id,
                "student_ids": student_ids.split(','),
                "data": data
            })
        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
            
    @staticmethod
    def get_weekly_activity():
        course_id = request.args.get('course_id')
        student_id = request.args.get('student_id')
        
        if not course_id:
            return jsonify({"error": "Missing course_id"}), 400
            
        try:
            data = ActivityService.get_weekly_activity(course_id, student_id)
            return jsonify({
                "course_id": course_id,
                "student_id": student_id,
                "week_wise_activity": data
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def download_report():
        course_id = request.args.get('course_id')
        if not course_id:
            return jsonify({"error": "Missing course_id parameter"}), 400

        try:
            course_name = CourseService.get_course_name(course_id)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            sanitized_course_name = "".join(x for x in str(course_name) if x.isalnum() or x in [' ', '_']).strip()
            filename = f"{sanitized_course_name}_activity_report_{timestamp}.csv"
            
            with Database.get_connection() as conn:
                query = f"SELECT * FROM page_view_analysis_course_{course_id}"
                df = pd.read_sql_query(query, conn)
                
                if df.empty:
                    return jsonify({"error": "No data found for this course", "success": False}), 404
                
                df = df.drop(['original_id'], axis=1)
                
                output = df.to_csv(index=False)
                
                return Response(
                    output,
                    mimetype="text/csv",
                    headers={
                        "Content-Disposition": f"attachment;filename={filename}",
                        "Content-Type": "text/csv",
                    }
                )
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500