from app.database.connection import Database
from app.analyzer.course_analyzer import CourseSummaryAnalyzer 
from datetime import datetime

class CourseService:
    @staticmethod
    def get_all_courses():
        with Database.get_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT course_id, name FROM course_info"
            cursor.execute(query)
            rows = cursor.fetchall()
            return [{"course_id": row.course_id, "name": row.name} for row in rows]
    
    @staticmethod
    def get_course_name(course_id):
        with Database.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM course_info WHERE course_id = ?", (course_id,))
            result = cursor.fetchone()
            return result[0] if result else f"course_{course_id}"
        
    @staticmethod
    def get_students_in_course(course_id):
        with Database.get_connection() as conn:
            cursor = conn.cursor()
            query = f"""
            SELECT student_id 
            FROM page_view_analysis_course_{course_id}
            GROUP BY student_id
            ORDER BY student_id
            """
            cursor.execute(query)
            rows = cursor.fetchall()
         
            return [
                {
                    "student_id": str(row[0]), 
                    "name": f"Student {idx + 1}" 
                } for idx, row in enumerate(rows)
            ]
            
    @staticmethod
    def get_course_summary(course_id, start_date, end_date):
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()

            start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
            end_datetime = datetime.strptime(end_date, "%Y-%m-%d")

            print(f"\nInput dates:")
            print(f"start_date: {start_date}, type: {type(start_date)}")
            print(f"end_date: {end_date}, type: {type(end_date)}")
            print(f"Formatted datetime objects for SQL:")
            print(f"start_datetime: {start_datetime}")
            print(f"end_datetime: {end_datetime}")

            query = """
            SELECT user_id, date, views 
            FROM page_views
            WHERE course_id = ? AND date BETWEEN ? AND ?
            ORDER BY user_id, date
            """

            cursor.execute(query, (course_id, start_datetime, end_datetime))
            rows = cursor.fetchall()

            all_student_data = []
            current_user = None
            current_user_data = []

            for row in rows:
                user_id = row[0]

                if current_user != user_id and current_user is not None:
                    if current_user_data:
                        all_student_data.append(current_user_data)
                    current_user_data = []

                current_user = user_id
                student_data = {
                    'id': user_id,
                    'date': row[1].strftime("%Y-%m-%d %H:%M:%S"),
                    'views': row[2]
                }
                current_user_data.append(student_data)

            if current_user_data:
                all_student_data.append(current_user_data)

            conn.close()

            analyzer = CourseSummaryAnalyzer(all_student_data, start_date, end_date)
            return analyzer.generate_response()

        except Exception as e:
            print(f"\nError details:")
            print(f"Error type: {type(e)}")
            print(f"Error message: {str(e)}")
            raise Exception(f"Error generating course summary: {str(e)}")
        
    @staticmethod
    def get_course_participations(course_id):
        with Database.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT module_id,module_name, assignment_id, title, status FROM assignments_by_modules WHERE course_id = ?", (course_id,))
            rows = cursor.fetchall()
            return [{"module_id": row.module_id,"module_name":row.module_name, "assignment_id": row.assignment_id,"title":row.title, "status": row.status} for row in rows]
        
    @staticmethod
    def get_course_device_stats(course_id):
        
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()
            cursor = conn.cursor()

            cursor.execute('''
                SELECT 
                    device_type,
                    COUNT(*) as count,
                    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
                FROM detailed_page_views
                GROUP BY device_type
                ORDER BY count DESC
            ''')
            
            rows = cursor.fetchall()
            
            device_stats = [{
                'device_type': row[0],
                'count': row[1],
                'percentage': round(row[2], 2)
            } for row in rows]
            
            return device_stats
        finally:
            conn.close()
            
    @staticmethod
    def get_course_video_stats(course_id):
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()

            cursor.execute('''
                SELECT 
                    COUNT(DISTINCT v.object_id) as total_videos,
                    SUM(v.count_plays) as total_plays,
                    SUM(v.unique_viewers) as total_viewers,
                    AVG(v.avg_completion_rate) as avg_completion_rate,
                    AVG(v.engagement_ranking) as avg_engagement,
                    SUM(v.sum_time_viewed) / 3600 as total_hours_viewed,
                    AVG(v.avg_view_drop_off) as avg_drop_off
                FROM video_analytics v
               
            ''')
            overview = cursor.fetchone()

            cursor.execute('''
                SELECT TOP 5
                    v.entry_name,
                    v.count_plays as views,
                    v.unique_viewers,
                    v.avg_completion_rate,
                    v.duration_secs / 60.0 as duration_mins,
                    v.avg_view_drop_off
                FROM video_analytics v
                ORDER BY v.count_plays DESC
            ''')   
          
            top_videos = cursor.fetchall()

            return {
                'overview': {
                    'total_videos': overview.total_videos,
                    'total_plays': overview.total_plays,
                    'total_viewers': overview.total_viewers,
                    'avg_completion_rate': round(overview.avg_completion_rate, 2),
                    'avg_engagement': round(overview.avg_engagement, 2),
                    'total_hours_viewed': round(overview.total_hours_viewed, 2),
                    'avg_drop_off': round(overview.avg_drop_off, 2)
                },
                'top_videos': [{
                    'title': video.entry_name,
                    'views': video.views,
                    'unique_viewers': video.unique_viewers,
                    'completion_rate': round(video.avg_completion_rate, 2),
                    'duration_mins': round(video.duration_mins, 2),
                    'drop_off_rate': round(video.avg_view_drop_off, 2)
                } for video in top_videos]
            }
            
        except Exception as e:
            print(f"Error in get_course_video_stats: {str(e)}")
            raise e
        finally:
            conn.close()
            
    @staticmethod
    def get_course_discussion_stats(course_id):
        try:
            conn = Database.get_connection()
            cursor = conn.cursor()

            cursor.execute("""
                SELECT 
                    CASE 
                        WHEN EXISTS (SELECT 1 FROM discussion_entries WHERE course_id = ?) 
                        OR EXISTS (SELECT 1 FROM discussion_replies WHERE course_id = ?)
                        THEN 1 
                        ELSE 0 
                    END as has_discussions
            """, (course_id, course_id))
            
            has_discussions = cursor.fetchone()[0]
            
            if not has_discussions:
                return {
                    'has_discussions': False,
                    'overview': {
                        'total_entries': 0,
                        'total_replies': 0,
                        'unique_posters': 0,
                        'total_interactions': 0
                    },
                    'top_discussions': []
                }

            cursor.execute("""
                SELECT 
                    (SELECT COUNT(*) FROM discussion_entries WHERE course_id = ?) as total_entries,
                    (SELECT COUNT(*) FROM discussion_replies WHERE course_id = ?) as total_replies,
                    (SELECT COUNT(DISTINCT id) FROM discussion_entries WHERE course_id = ?) as unique_posters
            """, (course_id, course_id, course_id))
            
            overview = cursor.fetchone()

            cursor.execute("""
                SELECT TOP 5
                    e.id,
                    e.message as title,
                    COUNT(r.id) as reply_count,
                    e.date as posted_date
                FROM discussion_entries e
                LEFT JOIN discussion_replies r ON e.id = r.id
                WHERE e.course_id = ?
                GROUP BY e.id, e.message, e.date
                ORDER BY reply_count DESC
            """, (course_id,))
            
            top_discussions = cursor.fetchall()
            
            return {
                'has_discussions': True,
                'overview': {
                    'total_entries': overview[0],
                    'total_replies': overview[1],
                    'unique_posters': overview[2],
                    'total_interactions': overview[0] + overview[1]
                },
                'top_discussions': [{
                    'id': disc[0],
                    'title': disc[1][:100] + '...' if len(disc[1]) > 100 else disc[1],
                    'reply_count': disc[2],
                    'posted_date': disc[3].strftime('%Y-%m-%d')
                } for disc in top_discussions]
            }
            
        except Exception as e:
            print(f"Error in get_course_discussion_stats: {str(e)}")
            raise e
        finally:
            conn.close()
            
            
        

            