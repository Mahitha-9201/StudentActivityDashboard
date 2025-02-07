from flask import Blueprint
from app.controllers.activity_controller import ActivityController

activity_bp = Blueprint('activity', __name__)

@activity_bp.route('/api/detailed-weekly-activity', methods=['GET'])
def get_detailed_weekly_activity():
    return ActivityController.get_detailed_weekly_activity()

@activity_bp.route('/api/weekly-activity', methods=['GET'])
def weekly_activity():
    return ActivityController.get_weekly_activity()

@activity_bp.route('/api/download-report', methods=['GET'])
def download_report():
    return ActivityController.download_report()