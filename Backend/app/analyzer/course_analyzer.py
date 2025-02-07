import pandas as pd
from datetime import datetime, timedelta

class CourseSummaryAnalyzer:
    def __init__(self, all_student_data, course_start_date: str, course_end_date: str):
        self.start_date = datetime.strptime(course_start_date, '%Y-%m-%d').date()
        self.end_date = datetime.strptime(course_end_date, '%Y-%m-%d').date()
        self.all_student_data = self._load_data(all_student_data)
        
    def _load_data(self, original_data) -> pd.DataFrame:
        flattened_data = []
        for student_data in original_data:
            flattened_data.extend(student_data)

        df = pd.DataFrame(flattened_data)
        print("\nDate conversion debug:")
        print(f"Sample date before conversion: {df['date'].iloc[0] if not df.empty else 'No data'}")

        df['datetime'] = pd.to_datetime(df['date']) 
        print(f"Sample date after conversion: {df['datetime'].iloc[0] if not df.empty else 'No data'}")

        start_datetime = pd.to_datetime(self.start_date)
        end_datetime = pd.to_datetime(self.end_date) + pd.Timedelta(days=1) - pd.Timedelta(seconds=1)

        mask = (df['datetime'] >= start_datetime) & (df['datetime'] <= end_datetime)
        df = df[mask].copy()

        if df.empty:
            raise ValueError(f"No data found between {self.start_date} and {self.end_date}")
        
        df['date'] = df['datetime'].dt.date
        print("\nAfter date extraction:")
        high_traffic = df[df['views'] >= 200]
        print(high_traffic[['date', 'datetime', 'views']].to_string())

        df['hour'] = df['datetime'].dt.hour
        df['month'] = df['datetime'].dt.month
        df['month_name'] = df['datetime'].dt.strftime('%B')
        df['day'] = df['datetime'].dt.day
        df['weekday'] = df['datetime'].dt.strftime('%A')

        print(f"\nData loaded successfully:")
        print(f"Date range: {df['date'].min()} to {df['date'].max()}")
        print(f"Total records: {len(df)}")
        print(f"DataFrame columns: {df.columns.tolist()}")
        print(f"DataFrame dtypes:\n{df.dtypes}")

        return df
    
    def analyze_daily_patterns(self):
        """Analyze top and bottom days by page views including days with zero activity"""
  
        all_dates = pd.date_range(start=self.start_date, end=self.end_date, freq='D')
        
        daily_stats = (self.all_student_data.groupby('date')
                    .agg({
                        'views': 'sum'
                    }).reset_index())
        
        complete_daily_stats = pd.DataFrame({'date': all_dates.date})
        
        complete_daily_stats = complete_daily_stats.merge(
            daily_stats, 
            on='date', 
            how='left'
        ).fillna({'views': 0})
        
        top_days = complete_daily_stats.nlargest(5, 'views')
        bottom_days = complete_daily_stats.nsmallest(5, 'views')
        
        return {
            'top_days': top_days,
            'bottom_days': bottom_days
        }
    
    def analyze_monthly_patterns(self):
        """Analyze monthly patterns in page views"""
 
        monthly_stats = (self.all_student_data.groupby(['month', 'month_name'])
                        .agg({
                            'views': ['sum', 'mean', 'count'],
                            'date': 'nunique'
                        }).reset_index())
        
        monthly_stats.columns = ['month', 'month_name', 'total_views', 'avg_views', 'activity_count', 'active_days']
        
        month_days = {}
        current_date = self.start_date
        while current_date <= self.end_date:
            month = current_date.month
            if month not in month_days:
                month_days[month] = 0
            month_days[month] += 1
            current_date += timedelta(days=1)
        
        monthly_stats['total_days'] = monthly_stats['month'].map(month_days)
        
        monthly_stats['avg_daily_views'] = (monthly_stats['total_views'] / monthly_stats['total_days']).round(2)

        monthly_stats = monthly_stats.sort_values('month')
        
        monthly_stats['view_change_pct'] = (monthly_stats['total_views']
                                          .pct_change() * 100).round(2)
        
        return monthly_stats
    
    def analyze_detailed_patterns(self):
     
        start_ts = pd.Timestamp(self.start_date)
        end_ts = pd.Timestamp(self.end_date)

        daily_stats = (self.all_student_data.groupby('date')
                    .agg({
                        'views': ['sum', 'count', 'mean'],
                        'id': 'nunique'  
                    }).reset_index())

        daily_stats.columns = ['date', 'total_views', 'activity_count', 'avg_views', 'unique_users']

        daily_stats['date'] = pd.to_datetime(daily_stats['date'])
        daily_stats = daily_stats.sort_values('date')

        daily_stats['rolling_avg_7day'] = daily_stats['total_views'].rolling(window=7, min_periods=1).mean()
        daily_stats['view_change'] = daily_stats['total_views'].pct_change() * 100
        daily_stats['view_change'] = daily_stats['view_change'].fillna(0)

        daily_stats['day_of_week'] = daily_stats['date'].dt.strftime('%A')
        daily_stats['month'] = daily_stats['date'].dt.month
        daily_stats['month_name'] = daily_stats['date'].dt.strftime('%B')
        daily_stats['day'] = daily_stats['date'].dt.day

        first_monday = start_ts - pd.Timedelta(days=start_ts.weekday())

        week_ranges = []
        current_date = first_monday
        week_num = 1

        while current_date <= end_ts:
            week_end = current_date + pd.Timedelta(days=6)  
            week_ranges.append({
                'week_num': week_num,
                'start_date': current_date,
                'end_date': week_end
            })
            current_date += pd.Timedelta(days=7)
            week_num += 1

        def get_week_number(date):
            date_ts = pd.Timestamp(date)
            for week in week_ranges:
                if week['start_date'] <= date_ts <= week['end_date']:
                    return week['week_num']
            return None

        daily_stats['week_number'] = daily_stats['date'].apply(get_week_number)

    
        weekly_stats = daily_stats.groupby('week_number').agg({
            'total_views': 'sum',
            'unique_users': 'max',
            'date': ['min', 'max']
        }).reset_index()


        weekly_stats.columns = ['week_number', 'total_views', 'avg_users', 'week_start', 'week_end']

        weekly_stats['view_change'] = weekly_stats['total_views'].pct_change() * 100
        weekly_stats['view_change'] = weekly_stats['view_change'].fillna(0)

        def get_week_range(week_num):
            week_data = next(w for w in week_ranges if w['week_num'] == week_num)
            return [week_data['start_date'], week_data['end_date']]

        date_ranges = [get_week_range(week) for week in weekly_stats['week_number']]

        try:
            return {
                'daily': {
                    'dates': daily_stats['date'].dt.strftime('%Y-%m-%d').tolist(),
                    'views': daily_stats['total_views'].astype(int).tolist(),
                    'unique_users': daily_stats['unique_users'].astype(int).tolist(),
                    'rolling_average': daily_stats['rolling_avg_7day'].round(2).tolist(),
                    'view_change': daily_stats['view_change'].round(2).tolist()
                },
                'weekly': {
                    'weeks': weekly_stats['week_number'].tolist(),
                    'views': weekly_stats['total_views'].astype(int).tolist(),
                    'avg_users': weekly_stats['avg_users'].round(1).tolist(),
                    'view_change': weekly_stats['view_change'].round(2).tolist(),
                    'date_ranges': [[d[0].strftime('%Y-%m-%d'), d[1].strftime('%Y-%m-%d')] 
                                for d in date_ranges]
                },
                'monthly': {
                    'months': daily_stats['month_name'].unique().tolist(),
                    'views_by_month': daily_stats.groupby('month_name')['total_views'].sum().astype(int).tolist(),
                    'users_by_month': daily_stats.groupby('month_name')['unique_users'].max().tolist()
                }
            }
        except Exception as e:
            print(f"Error in analyze_detailed_patterns: {str(e)}")
            print(f"Daily stats dtypes: {daily_stats.dtypes}")
            print(f"Sample of daily_stats: {daily_stats.head()}")
            raise
    
    def analyze_hourly_patterns(self):
        """Analyze hourly patterns in page views"""
      
        hourly_stats = self.all_student_data.groupby('hour').agg({
            'views': 'sum',
            'id': 'nunique',
            'date': 'nunique'
        }).reset_index()
        
        total_days = (self.end_date - self.start_date).days + 1  
        total_views = int(hourly_stats['views'].sum())
        
        formatted_data = []
        for _, row in hourly_stats.iterrows():
            hour = int(row['hour'])
            views = int(row['views'])
            
            formatted_hour = (
                "12 AM" if hour == 0 
                else f"{hour} AM" if hour < 12 
                else "12 PM" if hour == 12 
                else f"{hour-12} PM"
            )
            
            period = (
                "Morning" if 5 <= hour <= 11
                else "Afternoon" if 12 <= hour <= 16
                else "Evening" if 17 <= hour <= 21
                else "Night"
            )
            
            formatted_data.append({
                'hour': hour,
                'formatted_hour': formatted_hour,
                'period': period,
                'views': views,
                'unique_users': int(row['id']),
                'unique_days': int(row['date']),
                'avg_daily_views': float(round(views / total_days, 2)),
                'percentage': float(round((views / total_views * 100), 2))
            })
        
        period_totals = {}
        for data in formatted_data:
            period = data['period']
            if period not in period_totals:
                period_totals[period] = {'views': 0, 'unique_users': 0}
            period_totals[period]['views'] += data['views']
            period_totals[period]['unique_users'] = max(
                period_totals[period]['unique_users'],
                data['unique_users']
            )
        
        period_order = {
            "Morning": 1,
            "Afternoon": 2,
            "Evening": 3,
            "Night": 4
        }
        
        period_summary = []
        for period, totals in sorted(period_totals.items(), key=lambda x: period_order[x[0]]):
            period_summary.append({
                'period': period,
                'views': int(totals['views']),
                'unique_users': int(totals['unique_users']),
                'percentage': float(round((totals['views'] / total_views * 100), 2))
            })

        return {
            'hourly_data': sorted(formatted_data, key=lambda x: x['views'], reverse=True),
            'period_summary': period_summary
        }

    
    def get_high_level_overview(self):
        """Generate high-level overview statistics"""
        total_views = self.all_student_data['views'].sum()
        unique_users = self.all_student_data['id'].nunique()  
        total_days = (self.end_date - self.start_date).days + 1
        avg_views_per_day = round(total_views / total_days, 2)
        active_days = self.all_student_data['date'].nunique()

        return {
            'total_views': int(total_views),
            'unique_users': int(unique_users),
            'total_days': total_days,
            'active_days': active_days,
            'avg_views_per_day': avg_views_per_day
        }
        
    def generate_report(self):
        overview = self.get_high_level_overview()
        detailed_stats = self.analyze_detailed_patterns()
        hourly_data = self.analyze_hourly_patterns()  
        daily_stats = self.analyze_daily_patterns()
        monthly_stats = self.analyze_monthly_patterns()
        
        report = [
            f"Course Access Pattern Analysis ({self.start_date} to {self.end_date})\n",
            "Overview:",
            "-" * 50,
            f"Total Views: {overview['total_views']}",
            f"Unique Users: {overview['unique_users']}",
            f"Total Days: {overview['total_days']}",
            f"Active Days: {overview['active_days']}",
            f"Average Views/Day: {overview['avg_views_per_day']}"
        ]
        

        report.append("Monthly Patterns:")
        report.append("-" * 50)
        
        for month_name, views, users in zip(detailed_stats['monthly']['months'], 
                                        detailed_stats['monthly']['views_by_month'],
                                        detailed_stats['monthly']['users_by_month']):
            report.append(
                f"{month_name}:\n"
                f"- Total Views: {int(views)}\n"
                f"- Average Daily Users: {int(users)}"
            )

        report.append("\nDaily Patterns:")
        report.append("-" * 50)

        report.append("Top 5 Page View Days:")
        for _, day in daily_stats['top_days'].iterrows():
            formatted_date = day['date'].strftime('%m/%d')
            report.append(f"- {formatted_date} ({int(day['views'])} views)")

        report.append("\nBottom 5 Page View Days:")
        for _, day in daily_stats['bottom_days'].iterrows():
            formatted_date = day['date'].strftime('%m/%d')
            report.append(f"- {formatted_date} ({int(day['views'])} views)")

        report.append("\nWeekly Patterns:")
        report.append("-" * 50)
        
        for week_num, views, users, week_range in zip(detailed_stats['weekly']['weeks'],
                                                    detailed_stats['weekly']['views'],
                                                    detailed_stats['weekly']['avg_users'],
                                                    detailed_stats['weekly']['date_ranges']):
            report.append(
                f"Week {week_num} ({week_range[0]} to {week_range[1]}):\n"
                f"- Total Views: {int(views)}\n"
                f"- Average Users: {int(users)}"
            )
 
        report.append("\nHourly Patterns:")
        report.append("-" * 50)

        report.append("Peak Hours (Top 5):")
        for hour in hourly_data['hourly_data'][:5]:  
            report.append(
                f"{hour['formatted_hour']} ({hour['period']}): "
                f"{hour['views']} views "
                f"({hour['percentage']}% of total, {hour['avg_daily_views']} views/day)"
            )

        report.append("\nTime Period Distribution:")
        for period in hourly_data['period_summary']:
            report.append(
                f"{period['period']}: {period['views']} views "
                f"({period['percentage']}% of total)"
            )
        
        return "\n".join(report)
    
    def generate_response(self):
        """Generate both text report and structured data"""
        overview = self.get_high_level_overview()
        detailed_stats = self.analyze_detailed_patterns()
        hourly_stats = self.analyze_hourly_patterns()
        daily_stats = self.analyze_daily_patterns()
  
        text_report = self.generate_report()

        structured_data = {
            "overview": overview,
            "daily": {
                "dates": detailed_stats['daily']['dates'],
                "views": detailed_stats['daily']['views'],
                "unique_users": detailed_stats['daily']['unique_users'],
                "rolling_average": detailed_stats['daily']['rolling_average'],
                "view_change": detailed_stats['daily']['view_change']
            },
             "weekly": {
                "weeks": detailed_stats['weekly']['weeks'], 
                "views": detailed_stats['weekly']['views'],
                "avg_users": detailed_stats['weekly']['avg_users'],
                "view_change": detailed_stats['weekly']['view_change'],
                "date_ranges": detailed_stats['weekly']['date_ranges']  
            },
            "monthly": {
                "months": detailed_stats['monthly']['months'],
                "views": detailed_stats['monthly']['views_by_month'],
                "users": detailed_stats['monthly']['users_by_month']
            },
            "hourly": {
            "hours": hourly_stats['hourly_data'],
            "periods": hourly_stats['period_summary']
        }
        }
        
        return {
            "summary": text_report,
            "data": structured_data
        }