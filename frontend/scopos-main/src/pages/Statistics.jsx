import "./Dashboard.css";
import { useEffect, useMemo, useState } from "react";
import { getLocale, readStoredJson, t } from "../utils/appSettings";

const rangeOptions = ["range7", "range15", "range30", "range90", "range180", "range365"];
const rangeToDays = {
  range7: 7,
  range15: 15,
  range30: 30,
  range90: 90,
  range180: 180,
  range365: 365,
};

export default function Statistics() {
  const [createdHabits, setCreatedHabits] = useState([]);
  const [tasksByHabitDate, setTasksByHabitDate] = useState({});
  const [range, setRange] = useState("range7");
  const text = t();
  const locale = getLocale();

  useEffect(() => {
    const loadStatisticsData = () => {
      const habits = readStoredJson("createdHabits", []);
      const tasks = readStoredJson("tasksByHabitDate", {});
      setCreatedHabits(habits);
      setTasksByHabitDate(tasks);
    };

    loadStatisticsData();
    window.addEventListener("habitsUpdated", loadStatisticsData);
    window.addEventListener("tasksUpdated", loadStatisticsData);
    window.addEventListener("storage", loadStatisticsData);

    return () => {
      window.removeEventListener("habitsUpdated", loadStatisticsData);
      window.removeEventListener("tasksUpdated", loadStatisticsData);
      window.removeEventListener("storage", loadStatisticsData);
    };
  }, []);

  const daysCount = rangeToDays[range] || 7;

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const allTasks = useMemo(() => {
    const result = [];

    Object.entries(tasksByHabitDate).forEach(([habitId, datesMap]) => {
      Object.entries(datesMap).forEach(([dateKey, tasks]) => {
        tasks.forEach((task) => {
          result.push({ ...task, habitId, dateKey });
        });
      });
    });

    return result;
  }, [tasksByHabitDate]);

  const filteredChartData = useMemo(() => {
    const today = new Date();
    const data = [];

    for (let i = daysCount - 1; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = getDateKey(date);
      const dayTasks = allTasks.filter((task) => task.dateKey === dateKey);
      const completedTasks = dayTasks.filter((task) => task.completed);

      data.push({
        label: date.toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
        }),
        total: dayTasks.length,
        completed: completedTasks.length,
      });
    }

    return data;
  }, [allTasks, daysCount, locale]);

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((task) => task.completed).length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const totalHabits = createdHabits.length;

  const averagePerDay = useMemo(() => {
    if (daysCount === 0) return 0;
    return (completedTasks / daysCount).toFixed(1);
  }, [completedTasks, daysCount]);

  const totalXP = useMemo(
    () => createdHabits.reduce((sum, habit) => sum + Number(habit.xp || 0), 0),
    [createdHabits]
  );

  const bestDay = useMemo(() => {
    if (filteredChartData.length === 0) return 0;
    return Math.max(...filteredChartData.map((item) => item.completed), 0);
  }, [filteredChartData]);

  const maxChartValue = useMemo(() => {
    const values = filteredChartData.map((item) => item.completed);
    const max = Math.max(...values, 0);
    return max === 0 ? 5 : max;
  }, [filteredChartData]);

  const chartPoints = useMemo(() => {
    if (filteredChartData.length === 0) return "";

    const width = 560;
    const height = 180;
    const paddingX = 25;
    const paddingY = 20;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    return filteredChartData
      .map((item, index) => {
        const x = paddingX + (filteredChartData.length === 1
          ? usableWidth / 2
          : (index / (filteredChartData.length - 1)) * usableWidth);
        const y = height - paddingY - (item.completed / maxChartValue) * usableHeight;
        return `${x},${y}`;
      })
      .join(" ");
  }, [filteredChartData, maxChartValue]);

  return (
    <div className="statistics-page">
      <div className="statistics-header-card">
        <div className="statistics-header-left">
          <h2>{text.statisticsOverview}</h2>
          <p>{text.statisticsSubtitle}</p>
        </div>

        <select
          className="statistics-range-select"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          {rangeOptions.map((option) => (
            <option key={option} value={option}>
              {text[option]}
            </option>
          ))}
        </select>
      </div>

      <div className="statistics-chart-card">
        <div className="statistics-section-top">
          <h3>{text.weeklyStudies}</h3>
        </div>

        <div className="statistics-chart-wrap">
          <svg viewBox="0 0 560 180" className="statistics-line-chart" preserveAspectRatio="none">
            <line x1="25" y1="160" x2="535" y2="160" className="chart-axis" />
            <line x1="25" y1="120" x2="535" y2="120" className="chart-grid" />
            <line x1="25" y1="80" x2="535" y2="80" className="chart-grid" />
            <line x1="25" y1="40" x2="535" y2="40" className="chart-grid" />

            {chartPoints && <polyline fill="none" points={chartPoints} className="chart-line" />}

            {filteredChartData.map((item, index) => {
              const width = 560;
              const height = 180;
              const paddingX = 25;
              const paddingY = 20;
              const usableWidth = width - paddingX * 2;
              const usableHeight = height - paddingY * 2;
              const x = paddingX + (filteredChartData.length === 1
                ? usableWidth / 2
                : (index / (filteredChartData.length - 1)) * usableWidth);
              const y = height - paddingY - (item.completed / maxChartValue) * usableHeight;

              return <circle key={item.label} cx={x} cy={y} r="5" className="chart-point" />;
            })}
          </svg>

          <div className="statistics-chart-labels">
            {filteredChartData.map((item) => (
              <span key={item.label}>{item.label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="statistics-cards-grid">
        <div className="statistics-mini-card">
          <strong>{completedTasks}</strong>
          <span>{text.totalPerfectDays}</span>
          <div className="mini-progress-track">
            <div className="mini-progress-fill" style={{ width: `${Math.min(completionRate, 100)}%` }}></div>
          </div>
        </div>

        <div className="statistics-mini-card">
          <strong>{averagePerDay}</strong>
          <span>{text.averagePerDay}</span>

          <div className="mini-bars">
            {filteredChartData.slice(-7).map((item, index) => (
              <div
                key={index}
                className="mini-bar"
                style={{ height: `${Math.max(18, (item.completed / Math.max(bestDay, 1)) * 60)}px` }}
              ></div>
            ))}
          </div>
        </div>

        <div className="statistics-mini-card">
          <strong>{completionRate}%</strong>
          <span>{text.habitCompletionRate}</span>

          <div className="statistics-circle-wrap">
            <div
              className="statistics-circle-progress"
              style={{
                background: `conic-gradient(#1f5aa6 ${completionRate}%, #dfe7f2 ${completionRate}% 100%)`,
              }}
            >
              <div className="statistics-circle-inner"></div>
            </div>
          </div>
        </div>

        <div className="statistics-mini-card">
          <strong>{totalHabits}</strong>
          <span>{text.totalHabitsBuilt}</span>
          <div className="mini-progress-track">
            <div className="mini-progress-fill" style={{ width: `${Math.min(totalHabits * 20, 100)}%` }}></div>
          </div>
        </div>
      </div>

      <div className="statistics-summary-card">
        <h3>{text.quickSummary}</h3>
        <p>{text.totalTasks}: {totalTasks}</p>
        <p>{text.completedTasks}: {completedTasks}</p>
        <p>{text.totalXpEarned}: {totalXP}</p>
        <p>{text.bestDayScore}: {bestDay}</p>
      </div>
    </div>
  );
}
