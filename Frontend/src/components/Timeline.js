import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const Timeline = ({ chartData, startDate, endDate }) => {
  const [timelineView, setTimelineView] = useState("monthly");

  const periods = [
    { label: "12 AM", startHour: 0 },
    { label: "3 AM", startHour: 3 },
    { label: "6 AM", startHour: 6 },
    { label: "9 AM", startHour: 9 },
    { label: "12 PM", startHour: 12 },
    { label: "3 PM", startHour: 15 },
    { label: "6 PM", startHour: 18 },
    { label: "9 PM", startHour: 21 },
    { label: "12 AM", startHour: 24 },
  ];

  const processMonthlyData = () => {
    if (!chartData?.monthly?.months) return [];

    return chartData.monthly.months.map((month, index) => ({
      month,
      views: chartData.monthly.views[index],
      users: chartData.monthly.users[index],
    }));
  };

  const processWeeklyData = (startDate, endDate) => {
    if (
      !chartData?.weekly ||
      !chartData.weekly.weeks ||
      chartData.weekly.weeks.length === 0
    )
      return [];

    const totalWeeks =
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (7 * 24 * 60 * 60 * 1000)
      ) + 1;

    const allWeeklyData = [];
    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      allWeeklyData.push({
        weekNum,
        views: 0,
        users: 0,
        change: 0,
        dateRange: "",
      });
    }

    const existingWeekData = new Map();
    if (chartData.weekly.weeks && chartData.weekly.weeks.length > 0) {
      chartData.weekly.weeks.forEach((week, index) => {
        existingWeekData.set(week, {
          views: chartData.weekly.views[index],
          users: chartData.weekly.avg_users[index],
          change: chartData.weekly.view_change[index],
          dateRange: chartData.weekly.date_ranges[index],
        });
      });
    }

    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(weekStartDate.getDate() + (weekNum - 1) * 7);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      if (existingWeekData.has(weekNum)) {
        const data = existingWeekData.get(weekNum);
        allWeeklyData[weekNum - 1] = {
          weekNum,
          views: data.views,
          users: data.users,
          change: data.change,
          dateRange: `${weekStartDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${weekEndDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`,
        };
      } else {
        allWeeklyData[weekNum - 1] = {
          weekNum,
          views: 0,
          users: 0,
          change: 0,
          dateRange: `${weekStartDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - ${weekEndDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`,
        };
      }
    }

    return allWeeklyData;
  };

  const processHourlyData = () => {
    if (!chartData?.hourly?.hours) return [];

    const periodData = periods.slice(0, -1).map((period, index) => ({
      periodLabel: period.label,
      views: 0,
      periodIndex: index,
      startHour: period.startHour,
    }));

    chartData.hourly.hours.forEach((hourData) => {
      const periodIndex = Math.floor(hourData.hour / 3);
      if (periodData[periodIndex]) {
        periodData[periodIndex].views += hourData.views;
      }
    });

    return periodData.sort((a, b) => a.periodIndex - b.periodIndex);
  };

  const monthlyData = processMonthlyData();
  const weeklyData = processWeeklyData(startDate, endDate);
  const hourlyData = processHourlyData();
  const renderHourlyChart = (hourlyData) => (
    <BarChart
      data={hourlyData}
      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="displayHour"
        angle={-45}
        textAnchor="end"
        height={80}
        label={{ value: "Hour of Day", position: "bottom" }}
      />
      <YAxis />
      <Tooltip
        content={({ active, payload, label }) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
              <div className="bg-white p-3 border rounded shadow">
                <p className="font-semibold">{data.week}</p>
                <p className="text-sm text-gray-600">{data.dateRange}</p>
                <p className="text-blue-600">Views: {data.views}</p>
                <p className="text-gray-600">Users: {data.users}</p>
                {data.change !== undefined && Math.abs(data.change) > 0 && (
                  <p
                    className={
                      data.change > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {data.change > 0 ? "↑" : "↓"} {Math.abs(data.change)}%
                  </p>
                )}
              </div>
            );
          }
          return null;
        }}
      />
      <Legend />
      <Bar name="Views" dataKey="views" fill="#2563eb" />
    </BarChart>
  );
  const renderChart = () => {
    switch (timelineView) {
      case "monthly":
        return (
          <LineChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" textAnchor="end" height={80} />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow">
                      <p className="font-semibold">{data.month}</p>
                      <p className="text-blue-600">Views: {data.views}</p>
                      <p className="text-gray-600">Users: {data.users}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              name="Views"
              type="linear"
              dataKey="views"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case "weekly":
        return (
          <LineChart
            data={weeklyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="weekNum"
              tickFormatter={(value) => `Week ${value}`}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow">
                      <p className="font-semibold">Week {data.weekNum}</p>
                      <p className="text-sm text-gray-600">{data.dateRange}</p>
                      <p className="text-blue-600">Views: {data.views}</p>
                      <p className="text-gray-600">Users: {data.users}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              name="Views"
              type="linear"
              dataKey="views"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
      case "hourly":
        const hourlyData = processHourlyData();
        return (
          <LineChart
            data={hourlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="periodLabel"
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const nextPeriod =
                    periods[(data.periodIndex + 1) % periods.length].label;
                  return (
                    <div className="bg-white p-3 border rounded shadow">
                      <p className="font-semibold">{`${data.periodLabel} - ${nextPeriod}`}</p>
                      <p className="text-blue-600">Total Views: {data.views}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              name="Views"
              type="linear"
              dataKey="views"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Activity Timeline
        </h3>
        <select
          value={timelineView}
          onChange={(e) => setTimelineView(e.target.value)}
          className="p-2 border border-gray-300 rounded-md shadow-sm text-sm"
        >
          <option value="monthly">Monthly View</option>
          <option value="weekly">Weekly View</option>
          <option value="hourly">Hourly View</option>
        </select>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {(timelineView === "monthly" || timelineView === "weekly") && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">
            {timelineView === "monthly" ? "Monthly" : "Weekly"} Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {timelineView === "monthly" ? (
              <>
                <div>
                  <span className="text-gray-600">Total Months:</span>
                  <span className="ml-2 font-semibold">
                    {monthlyData.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Peak Month:</span>
                  <span className="ml-2 font-semibold">
                    {
                      monthlyData.reduce(
                        (max, month) => (month.views > max.views ? month : max),
                        monthlyData[0]
                      ).month
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Monthly Views:</span>
                  <span className="ml-2 font-semibold">
                    {Math.round(
                      monthlyData.reduce((sum, month) => sum + month.views, 0) /
                        monthlyData.length
                    )}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-gray-600">Total Weeks:</span>
                  <span className="ml-2 font-semibold">
                    {weeklyData.length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Peak Week:</span>
                  {weeklyData.length > 0 ? (
                    <span className="ml-2 font-semibold">
                      Week{" "}
                      {
                        weeklyData.reduce(
                          (max, week) => (week.views > max.views ? week : max),
                          weeklyData[0]
                        ).weekNum
                      }
                    </span>
                  ) : (
                    <span className="ml-2 font-semibold">N/A</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">Avg Weekly Views:</span>
                  <span className="ml-2 font-semibold">
                    {Math.round(
                      weeklyData.reduce((sum, week) => sum + week.views, 0) /
                        weeklyData.length
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
