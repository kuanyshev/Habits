import "./Dashboard.css";
import { useEffect, useMemo, useState } from "react";
import logo from "../assets/logo.png";
import mascot from "../assets/mascot.png";
import AddNew from "./AddNew";
import Tasks from "./Tasks";
import Statistics from "./Statistics";
import Community from "./Community";
import AppSettings from "./AppSettings";
import ProfileSettings from "./ProfileSettings";
import { useNavigate } from "react-router-dom";
import { readStoredJson, t } from "../utils/appSettings";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

  const [userName, setUserName] = useState(() => {
    const savedUserName = localStorage.getItem("userName");
    const savedUser = readStoredJson("user", {});
    return savedUserName || savedUser.username || "Togzhan";
  });

  const [avatar, setAvatar] = useState(localStorage.getItem("userAvatar") || "");
  const [createdHabits, setCreatedHabits] = useState([]);
  const [activeHabitId, setActiveHabitId] = useState(
    localStorage.getItem("activeHabitId") || ""
  );
  const [tasksByHabitDate, setTasksByHabitDate] = useState({});

  const text = t();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const load = () => {
      const savedUserName = localStorage.getItem("userName");
      const savedUser = readStoredJson("user", {});

      setCreatedHabits(readStoredJson("createdHabits", []));
      setTasksByHabitDate(readStoredJson("tasksByHabitDate", {}));
      setUserName(savedUserName || savedUser.username || "Togzhan");
      setAvatar(localStorage.getItem("userAvatar") || "");
      setActiveHabitId(localStorage.getItem("activeHabitId") || "");
    };

    load();
    window.addEventListener("storage", load);

    return () => window.removeEventListener("storage", load);
  }, [activeTab]);

  const todayKey = new Date().toISOString().split("T")[0];

  const activeHabit =
    createdHabits.find((h) => String(h.id) === String(activeHabitId)) ||
    createdHabits[0];

  const todayTasks = useMemo(() => {
    if (!activeHabit) return [];
    return (tasksByHabitDate?.[activeHabit.id]?.[todayKey] || []).slice();
  }, [tasksByHabitDate, activeHabit, todayKey]);

  const totalCompletedTasks = useMemo(() => {
    if (!activeHabit) return 0;

    let count = 0;
    Object.values(tasksByHabitDate?.[activeHabit.id] || {}).forEach((day) => {
      day.forEach((task) => {
        if (task.completed) count += 1;
      });
    });

    return count;
  }, [tasksByHabitDate, activeHabit]);

  const otherHabits = useMemo(() => {
    if (!activeHabit) return createdHabits;
    return createdHabits.filter(
      (habit) => String(habit.id) !== String(activeHabit.id)
    );
  }, [createdHabits, activeHabit]);

  const currentHabitProgress = useMemo(() => {
    if (!activeHabit) return 0;

    const xpMax = Number(activeHabit.xpMax || 1000);
    const xp = Number(activeHabit.xp || 0);
    if (xpMax <= 0) return 0;

    return Math.min(100, Math.round((xp / xpMax) * 100));
  }, [activeHabit]);

  const completedTodayTasks = todayTasks.filter((task) => task.completed).length;
  const todayProgress = todayTasks.length
    ? Math.round((completedTodayTasks / todayTasks.length) * 100)
    : 0;

  const ringRadius = 78;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (Math.min(todayProgress, 100) / 100) * ringCircumference;

  const handleDeleteTask = (taskId) => {
    if (!activeHabitId || !window.confirm(text.deleteTaskConfirm)) {
      return;
    }

    const todayHabitTasks = { ...(tasksByHabitDate[activeHabitId] || {}) };
    const nextTodayTasks = (todayHabitTasks[todayKey] || []).filter(
      (task) => task.id !== taskId
    );

    if (nextTodayTasks.length === 0) {
      delete todayHabitTasks[todayKey];
    } else {
      todayHabitTasks[todayKey] = nextTodayTasks;
    }

    const nextTasksByHabitDate = { ...tasksByHabitDate };

    if (Object.keys(todayHabitTasks).length === 0) {
      delete nextTasksByHabitDate[activeHabitId];
    } else {
      nextTasksByHabitDate[activeHabitId] = todayHabitTasks;
    }

    setTasksByHabitDate(nextTasksByHabitDate);
    localStorage.setItem("tasksByHabitDate", JSON.stringify(nextTasksByHabitDate));
    window.dispatchEvent(new Event("tasksUpdated"));
    window.dispatchEvent(new Event("storage"));
  };

  const handleDeleteHabit = (habitId) => {
    const habitToDelete = createdHabits.find(
      (habit) => String(habit.id) === String(habitId)
    );

    if (!habitToDelete) {
      return;
    }

    if (!window.confirm(text.deleteGoalConfirm)) {
      return;
    }

    const nextHabits = createdHabits.filter(
      (habit) => String(habit.id) !== String(habitId)
    );
    const nextTasksByHabitDate = { ...tasksByHabitDate };
    delete nextTasksByHabitDate[habitId];

    localStorage.setItem("createdHabits", JSON.stringify(nextHabits));
    localStorage.setItem("tasksByHabitDate", JSON.stringify(nextTasksByHabitDate));

    const nextActiveHabitId = nextHabits[0]?.id || "";
    if (nextActiveHabitId) {
      localStorage.setItem("activeHabitId", nextActiveHabitId);
    } else {
      localStorage.removeItem("activeHabitId");
    }

    setCreatedHabits(nextHabits);
    setTasksByHabitDate(nextTasksByHabitDate);
    setActiveHabitId(nextActiveHabitId);

    window.dispatchEvent(new Event("habitsUpdated"));
    window.dispatchEvent(new Event("tasksUpdated"));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <img src={logo} alt="logo" className="sidebar-logo" />

        <ul className="menu">
          <li
            className={activeTab === "dashboard" ? "active-menu" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            {text.dashboard}
          </li>
          <li
            className={activeTab === "tasks" ? "active-menu" : ""}
            onClick={() => setActiveTab("tasks")}
          >
            {text.tasks}
          </li>
          <li
            className={activeTab === "statistics" ? "active-menu" : ""}
            onClick={() => setActiveTab("statistics")}
          >
            {text.statistic}
          </li>
          <li
            className={activeTab === "addnew" ? "active-menu" : ""}
            onClick={() => setActiveTab("addnew")}
          >
            {text.addNew}
          </li>
          <li
            className={activeTab === "community" ? "active-menu" : ""}
            onClick={() => setActiveTab("community")}
          >
            {text.community}
          </li>
        </ul>

        <div className="bottom-menu">
          <p
            className={activeTab === "settings" ? "active-menu" : ""}
            onClick={() => setActiveTab("settings")}
          >
            {text.settings}
          </p>
          <p className="logout" onClick={handleLogout}>
            {text.logout}
          </p>
        </div>
      </aside>

      <main className="main">
        {activeTab === "dashboard" && (
          <div className="main-dashboard-ui">
            {!activeHabit ? (
              <div className="dashboard-empty-card">
                <h3>{text.noGoals}</h3>
                <p>{text.createFirstGoal}</p>
              </div>
            ) : (
              <>
                <div className="dashboard-top-row">
                  <div className="dashboard-character-card">
                    <img src={mascot} alt="Mascot" className="dashboard-mascot" />
                    <div className="dashboard-classic-badge">
                      {activeHabit.category || text.goal}
                    </div>
                    <div className="dashboard-level-text">
                      {text.level} {activeHabit.level || 1}
                    </div>
                  </div>

                  <div className="dashboard-top-center">
                    <h1 className="dashboard-user-big-name">{userName}</h1>

                    <div className="dashboard-stats-row">
                      <div className="dashboard-stat-box">
                        <p>{text.completedTasks}</p>
                        <strong>{totalCompletedTasks}</strong>
                      </div>

                      <div className="dashboard-stat-box">
                        <p>{text.tasksForToday}</p>
                        <strong>{todayTasks.length}</strong>
                      </div>

                      <div className="dashboard-days-circle">
                        <svg className="progress-ring" viewBox="0 0 180 180">
                          <circle className="ring-bg" cx="90" cy="90" r={ringRadius} />
                          <circle
                            className="ring-progress"
                            cx="90"
                            cy="90"
                            r={ringRadius}
                            strokeDasharray={ringCircumference}
                            strokeDashoffset={ringOffset}
                          />
                        </svg>

                        <div className="dashboard-days-content">
                          <span>{text.today}</span>
                          <strong>{todayProgress}%</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dashboard-content-grid">
                  <div className="dashboard-active-goal-card">
                    <div className="dashboard-active-goal-top">
                      <div className="dashboard-goal-title-wrap">
                        <img src={mascot} alt="Goal" className="goal-small-mascot" />

                        <div>
                          <h3>{activeHabit.habitName}</h3>
                          <p>
                            {activeHabit.startDate} - {activeHabit.endDate}
                          </p>
                        </div>
                      </div>

                      <div className="active-goal-actions">
                        <button
                          type="button"
                          className="delete-goal-btn"
                          onClick={() => handleDeleteHabit(activeHabit.id)}
                        >
                          {text.deleteGoal}
                        </button>

                        <div className="active-status-pill">
                          {activeHabit.status || text.activeStatus}
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-xp-row">
                      <span>
                        XP: {Number(activeHabit.xp || 0)} / {Number(activeHabit.xpMax || 1000)}
                      </span>
                      <div className="dashboard-xp-bar">
                        <div
                          className="dashboard-xp-fill"
                          style={{ width: `${currentHabitProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="tasks-for-today-box">
                      <h3>{text.tasksForToday}</h3>

                      {todayTasks.length === 0 ? (
                        <div className="dashboard-no-tasks">{text.noTasksToday}</div>
                      ) : (
                        todayTasks.map((task) => (
                          <div key={task.id} className="dashboard-task-today-row">
                            <div className="dashboard-task-left">
                              <img
                                src={mascot}
                                alt=""
                                className="task-mini-mascot"
                                aria-hidden="true"
                              />

                              <div>
                                <p>{task.text}</p>
                                <span>
                                  {task.startTime || "--:--"} - {task.endTime || "--:--"}
                                </span>
                              </div>
                            </div>

                            <div className="dashboard-task-actions">
                              <div
                                className={`dashboard-task-dot-right ${
                                  task.completed ? "done" : ""
                                }`}
                              ></div>

                              <button
                                type="button"
                                className="task-delete-btn task-delete-btn-soft"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                {text.delete}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="dashboard-other-goals">
                    <h2>{text.otherGoals}</h2>

                    {otherHabits.length === 0 ? (
                      <div className="dashboard-no-tasks">{text.noOtherGoals}</div>
                    ) : (
                      otherHabits.map((habit) => {
                        const habitProgress = Math.min(
                          100,
                          Math.round(
                            (Number(habit.xp || 0) / Number(habit.xpMax || 1000)) * 100
                          )
                        );

                        const end = new Date(habit.endDate);
                        const now = new Date();
                        end.setHours(23, 59, 59, 999);
                        now.setHours(0, 0, 0, 0);
                        const daysLeft = Math.max(
                          Math.ceil((end - now) / (1000 * 60 * 60 * 24)),
                          0
                        );

                        return (
                          <div key={habit.id} className="other-goal-card">
                            <div className="other-goal-left">
                              <img
                                src={mascot}
                                alt=""
                                className="goal-mini-icon"
                                aria-hidden="true"
                              />

                              <div>
                                <h4>{habit.habitName}</h4>
                                <p>{habit.description || text.noDescription}</p>

                                <div className="other-goal-xp-row">
                                  <span>{habitProgress}%</span>
                                  <div className="other-goal-xp-bar">
                                    <div
                                      className="other-goal-xp-fill"
                                      style={{ width: `${habitProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="other-goal-actions">
                              <div className="other-goal-days-badge">
                                <span>{text.days}</span>
                                <strong>{daysLeft}</strong>
                              </div>

                              <button
                                type="button"
                                className="delete-goal-btn"
                                onClick={() => handleDeleteHabit(habit.id)}
                              >
                                {text.delete}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "tasks" && <Tasks />}
        {activeTab === "statistics" && <Statistics />}
        {activeTab === "addnew" && <AddNew />}
        {activeTab === "community" && <Community />}
        {activeTab === "settings" && <AppSettings />}
      </main>

      <aside className="profile-panel">
        <p className="profile-title">{text.yourProfile}</p>

        <div
          className="profile-avatar-wrapper"
          onClick={() => setIsProfileSettingsOpen(true)}
        >
          {avatar ? (
            <img src={avatar} alt="avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar profile-avatar-fallback" aria-hidden="true">
              {(userName || "T").charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <p className="profile-name">{userName}</p>

        <p className="profile-desc">
          {text.continueJourney}
          <br />
          {text.achieveTarget}
        </p>
      </aside>

      {isProfileSettingsOpen && (
        <div
          className="settings-overlay"
          onClick={() => setIsProfileSettingsOpen(false)}
        >
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="settings-close"
              onClick={() => setIsProfileSettingsOpen(false)}
            >
              x
            </button>

            <ProfileSettings />
          </div>
        </div>
      )}
    </div>
  );
}
