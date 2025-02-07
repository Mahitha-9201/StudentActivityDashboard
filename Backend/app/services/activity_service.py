from app.database.connection import Database
from app.models.activity import WeeklyActivity

class ActivityService:
    @staticmethod
    def get_weekly_activity(course_id, student_id=None):
        with Database.get_connection() as conn:
            cursor = conn.cursor()
            
            base_query = f"""
                SELECT total_pageviews, active_days, avg_daily_views, avg_weekly_views, 
                       engagement_rate, morning_pct, afternoon_pct, evening_pct, night_pct, 
                       total_gaps_4days, longest_gap_days, total_gap_days  
                FROM page_view_analysis_course_{course_id}
            """
            
            if student_id:
                query = f"{base_query} WHERE student_id = ?"
                cursor.execute(query, (student_id,))
            else:
                cursor.execute(base_query)
            
            rows = cursor.fetchall()
            return [WeeklyActivity(row).to_dict() for row in rows]
        
    @staticmethod
    def get_detailed_weekly_activity(course_id, student_ids):
        with Database.get_connection() as conn:
            cursor = conn.cursor()
            
            student_id_list = [id.strip() for id in student_ids.split(',')]
            
            placeholders = ','.join(['?' for _ in student_id_list])
            query = f"""
                SELECT *
                FROM page_view_analysis_course_{course_id}
                WHERE student_id IN ({placeholders})
            """

            cursor.execute(query, student_id_list)

            columns = [column[0] for column in cursor.description]
            
            rows = cursor.fetchall()
            
            data = []
            for row in rows:
                row_dict = {}
                for i, value in enumerate(row):
                    row_dict[columns[i]] = value
                data.append(row_dict)

            return data