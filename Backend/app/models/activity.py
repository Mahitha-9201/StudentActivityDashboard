class WeeklyActivity:
    def __init__(self, row):
        self.total_pageviews = row[0]
        self.active_days = row[1]
        self.avg_daily_views = row[2]
        self.avg_weekly_views = row[3]
        self.engagement_rate = row[4]
        self.morning_pct = row[5]
        self.afternoon_pct = row[6]
        self.evening_pct = row[7]
        self.night_pct = row[8]
        self.total_gaps_4days = row[9]
        self.longest_gap_days = row[10]
        self.total_gap_days = row[11]
    
    def to_dict(self):
        return {
            "total_pageviews": self.total_pageviews,
            "active_days": self.active_days,
            "avg_daily_views": self.avg_daily_views,
            "avg_weekly_views": self.avg_weekly_views,
            "engagement_rate": self.engagement_rate,
            "morning_pct": self.morning_pct,
            "afternoon_pct": self.afternoon_pct,
            "evening_pct": self.evening_pct,
            "night_pct": self.night_pct,
            "total_gaps_4days": self.total_gaps_4days,
            "longest_gap_days": self.longest_gap_days,
            "total_gap_days": self.total_gap_days
        }