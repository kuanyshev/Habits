import "./Dashboard.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import mascot from "../assets/mascot.png";
import Settings from "./Settings";
import AddNew from "./AddNew";
import Tasks from "./Tasks";
import Statistics from "./Statistics";
import Community from "./Community";
import {
  clearAuth,
  fetchHabits,
  habitStorageKey,
  patchHabitOnServer,
} from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [, setCommunityView] = useState("feed");
  const [userName] = useState(localStorage.getItem("userName") || "Togzhan");
  const [avatar] = useState(localStorage.getItem("userAvatar") || "");
  const [createdHabits, setCreatedHabits] = useState([]);
  const [activeHabitId, setActiveHabitId] = useState(
    localStorage.getItem(habitStorageKey("activeHabitId")) || ""
  );
  const [tasksByHabitDate, setTasksByHabitDate] = useState({});

  useEffect(() => {
    const loadDashboardData = () => {
      const habits =
        JSON.parse(localStorage.getItem(habitStorageKey("createdHabits"))) || [];
      const tasks =
        JSON.parse(localStorage.getItem(habitStorageKey("tasksByHabitDate"))) ||
        {};
      const savedActiveId =
        localStorage.getItem(habitStorageKey("activeHabitId")) || "";

      setCreatedHabits(habits);
      setTasksByHabitDate(tasks);

      if (habits.length > 0) {
        const validHabit = habits.find((habit) => habit.id === savedActiveId);

        if (validHabit) {
          setActiveHabitId(savedActiveId);
        } else {
          localStorage.setItem(habitStorageKey("activeHabitId"), habits[0].id);
          setActiveHabitId(habits[0].id);
        }
      } else {
        setActiveHabitId("");
      }
    };

    loadDashboardData();

    window.addEventListener("habitsUpdated", loadDashboardData);
    window.addEventListener("tasksUpdated", loadDashboardData);
    window.addEventListener("storage", loadDashboardData);

    return () => {
      window.removeEventListener("habitsUpdated", loadDashboardData);
      window.removeEventListener("tasksUpdated", loadDashboardData);
      window.removeEventListener("storage", loadDashboardData);
    };
  }, [activeTab]);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) return;
    let cancelled = false;
    (async () => {
      try {
        const habits = await fetchHabits();
        if (cancelled || !habits.length) return;
        localStorage.setItem(
          habitStorageKey("createdHabits"),
          JSON.stringify(habits)
        );
        setCreatedHabits(habits);
        const savedActiveId =
          localStorage.getItem(habitStorageKey("activeHabitId")) || "";
        const valid = habits.find((h) => h.id === savedActiveId);
        if (valid) {
          setActiveHabitId(savedActiveId);
        } else {
          localStorage.setItem(habitStorageKey("activeHabitId"), habits[0].id);
          setActiveHabitId(habits[0].id);
        }
        window.dispatchEvent(new Event("habitsUpdated"));
      } catch (e) {
        console.warn(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayKey = getDateKey(new Date());

  const activeHabit =
    createdHabits.find((habit) => habit.id === activeHabitId) || createdHabits[0];

  const otherGoals = createdHabits.filter((habit) => habit.id !== activeHabit?.id);
  const todayTasks = useMemo(() => {
    if (!activeHabit) return [];

    const todayList = ((tasksByHabitDate[activeHabit.id] || {})[todayKey] || []).slice();

    return todayList.sort((a, b) => {
      const aTime = a.startTime || a.time || "";
      const bTime = b.startTime || b.time || "";
      return aTime.localeCompare(bTime);
    });
  }, [tasksByHabitDate, activeHabit, todayKey]);

  const totalCompletedTasks = useMemo(() => {
    if (!activeHabit) return 0;

    const habitTasks = tasksByHabitDate[activeHabit.id] || {};
    let count = 0;

    Object.values(habitTasks).forEach((dayTasks) => {
      dayTasks.forEach((task) => {
        if (task.completed) count += 1;
      });
    });

    return count;
  }, [tasksByHabitDate, activeHabit]);

  const daysProgress = useMemo(() => {
    if (!activeHabit) return { doneDays: 0, totalDays: 21 };

    const start = new Date(activeHabit.startDate);
    const end = new Date(activeHabit.endDate);

    const total =
      Math.max(
        1,
        Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
      ) || 21;

    const doneDaysSet = new Set();
    const habitTasks = tasksByHabitDate[activeHabit.id] || {};

    Object.entries(habitTasks).forEach(([dateKey, dayTasks]) => {
      const allCompleted = dayTasks.length > 0 && dayTasks.every((task) => task.completed);
      if (allCompleted) {
        doneDaysSet.add(dateKey);
      }
    });

    return {
      doneDays: doneDaysSet.size,
      totalDays: total,
    };
  }, [tasksByHabitDate, activeHabit]);

  const completeTaskFromDashboard = (taskId) => {
    if (!activeHabit) return;

    const currentHabitTasks = tasksByHabitDate[activeHabit.id] || {};
    const todayList = currentHabitTasks[todayKey] || [];
    const targetTask = todayList.find((task) => task.id === taskId);

    if (!targetTask || targetTask.completed) return;

    const rewardXP = Number(targetTask.xp) || 100;

    const updatedTasksByHabitDate = {
      ...tasksByHabitDate,
      [activeHabit.id]: {
        ...currentHabitTasks,
        [todayKey]: todayList.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        ),
      },
    };

    const updatedHabits = createdHabits.map((habit) => {
      if (habit.id !== activeHabit.id) return habit;

      let newXp = Number(habit.xp || 0) + rewardXP;
      let newLevel = Number(habit.level || 1);
      const xpMax = Number(habit.xpMax || 1000);

      while (newXp >= xpMax) {
        newXp -= xpMax;
        newLevel += 1;
      }

      return {
        ...habit,
        xp: newXp,
        level: newLevel,
      };
    });

    setTasksByHabitDate(updatedTasksByHabitDate);
    setCreatedHabits(updatedHabits);

    localStorage.setItem(
      habitStorageKey("tasksByHabitDate"),
      JSON.stringify(updatedTasksByHabitDate)
    );
    localStorage.setItem(
      habitStorageKey("createdHabits"),
      JSON.stringify(updatedHabits)
    );

    window.dispatchEvent(new Event("tasksUpdated"));
    window.dispatchEvent(new Event("habitsUpdated"));

    if (localStorage.getItem("accessToken")) {
      const updated = updatedHabits.find((h) => h.id === activeHabit.id);
      if (updated) {
        patchHabitOnServer(updated.id, {
          xp: updated.xp,
          xpMax: updated.xpMax,
          level: updated.level,
        }).catch(() => {});
      }
    }
  };

  const renderDashboardHome = () => {
    if (!activeHabit) {
      return (
        <div className="dashboard-empty-card">
          <h3>No goals yet</h3>
          <p>Create your first goal in Add new.</p>
        </div>
      );
    }

    return (
      <div className="main-dashboard-ui">
        <div className="dashboard-top-row">
          <div className="dashboard-character-card">
            <img src={mascot} alt="Mascot" className="dashboard-mascot" />
            <span className="dashboard-classic-badge">Classic</span>
            <p className="dashboard-level-text">{activeHabit.level} Level</p>
          </div>

          <div className="dashboard-top-center">
            <h1 className="dashboard-user-big-name">{userName}</h1>

            <div className="dashboard-stats-row">
              <div className="dashboard-stat-box">
                <p>Completed Tasks</p>
                <strong>{totalCompletedTasks}</strong>
              </div>

              <div className="dashboard-days-circle">
                <svg viewBox="0 0 120 120" className="progress-ring">
                  <circle cx="60" cy="60" r="48" className="ring-bg" />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    className="ring-progress"
                    strokeDasharray={`${(daysProgress.doneDays / daysProgress.totalDays) * 301.59} 301.59`}
                  />
                </svg>
                <div className="dashboard-days-content">
                  <span>Days</span>
                  <strong>
                    {daysProgress.doneDays}/{daysProgress.totalDays}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-content-grid">
          <div className="dashboard-active-goal-card">
            <div className="dashboard-active-goal-top">
              <div className="dashboard-goal-title-wrap">
                <img src={mascot} alt="Goal mascot" className="goal-small-mascot" />
                <div>
                  <h3>{activeHabit.habitName}</h3>
                  <p>{activeHabit.description || "No description"}</p>
                </div>
              </div>

              <span className="active-status-pill">{activeHabit.status}</span>
            </div>

            <div className="dashboard-xp-row">
              <span>XP</span>
              <div className="dashboard-xp-bar">
                <div
                  className="dashboard-xp-fill"
                  style={{
                    width: `${(activeHabit.xp / activeHabit.xpMax) * 100}%`,
                  }}
                ></div>
              </div>
              <span>
                {activeHabit.xp}/{activeHabit.xpMax}
              </span>
            </div>

            <div className="tasks-for-today-box">
              <h3>Tasks for today</h3>

              {todayTasks.length === 0 ? (
                <div className="dashboard-no-tasks">
                  No tasks for today yet.
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div key={task.id} className="dashboard-task-today-row">
                    <div className="dashboard-task-left">
                      <img
                        src={mascot}
                        alt="Task icon"
                        className="task-mini-mascot"
                      />
                      <div>
                        <p>{task.text}</p>
                        <span>
                          {task.startTime && task.endTime
                            ? `${task.startTime} - ${task.endTime}`
                            : task.time || "No time"}
                        </span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => completeTaskFromDashboard(task.id)}
                      disabled={task.completed}
                      className="dashboard-task-checkbox"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-other-goals">
            <h2>Other goals</h2>

            {otherGoals.length === 0 ? (
              <div className="dashboard-no-tasks">No other goals yet.</div>
            ) : (
              otherGoals.map((goal) => {
                const goalTasks = tasksByHabitDate[goal.id] || {};
                const totalGoalDays = Object.keys(goalTasks).length || 21;

                return (
                  <div key={goal.id} className="other-goal-card">
                    <div className="other-goal-left">
                      <img src={mascot} alt="Goal mascot" className="goal-mini-icon" />
                      <div>
                        <h4>{goal.habitName}</h4>
                        <p>{goal.description || "No description"}</p>

                        <div className="other-goal-xp-row">
                          <span>XP</span>
                          <div className="other-goal-xp-bar">
                            <div
                              className="other-goal-xp-fill"
                              style={{
                                width: `${(goal.xp / goal.xpMax) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span>
                            {goal.xp}/{goal.xpMax}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="other-goal-days-badge">
                      <span>Days</span>
                      <strong>{totalGoalDays}</strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <img src={logo} alt="SCOPOS logo" className="sidebar-logo" />

        <ul className="menu">
          <li
            className={activeTab === "dashboard" ? "active-menu" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </li>

          <li
            className={activeTab === "tasks" ? "active-menu" : ""}
            onClick={() => setActiveTab("tasks")}
          >
            Tasks
          </li>

          <li className={activeTab === "statistics" ? "active-menu" : ""} onClick={() => setActiveTab("statistics")}> Statistic </li>

          <li
            className={activeTab === "addnew" ? "active-menu" : ""}
            onClick={() => setActiveTab("addnew")}
          >
            Add new
          </li>

          <li className={activeTab === "community" ? "active-menu" : ""} onClick={() => {
    setActiveTab("community");
    setCommunityView("feed");
  }}>
Community
</li>
        </ul>

        <div className="bottom-menu">
          <p
            className={activeTab === "settings" ? "active-menu" : ""}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </p>
          <p
            className="logout"
            onClick={() => {
              clearAuth();
              navigate("/", { replace: true });
            }}
          >
            Logout
          </p>
        </div>
      </aside>

      <main className="main">
  {activeTab === "dashboard" && renderDashboardHome()}
  {activeTab === "tasks" && <Tasks />}
  {activeTab === "statistics" && <Statistics />}
  {activeTab === "addnew" && <AddNew />}
  {activeTab === "community" && <Community />}
  {activeTab === "settings" && <Settings />}
</main>

      {activeTab !== "settings" && (
        <aside className="profile-panel">
          <p className="profile-title">Your Profile</p>

          <div className="avatar-ring">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile avatar"
                className="avatar-circle avatar-img"
              />
            ) : (
              <div className="avatar-circle"></div>
            )}
          </div>

          <p className="profile-name">Hi, {userName}!</p>
          <p className="profile-text">
            Continue Your Journey
            <br />
            And Achieve Your Target
          </p>

          <div className="profile-mini-btn">◔</div>
        </aside>
      )}
    </div>
  );
}