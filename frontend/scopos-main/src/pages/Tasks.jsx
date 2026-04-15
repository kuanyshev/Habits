import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import { getLocale, readStoredJson, t } from "../utils/appSettings";

export default function Tasks() {
  const [habits, setHabits] = useState([]);
  const [activeHabitId, setActiveHabitId] = useState(
    localStorage.getItem("activeHabitId") || ""
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [inputValue, setInputValue] = useState("");
  const [taskStartTime, setTaskStartTime] = useState("");
  const [taskEndTime, setTaskEndTime] = useState("");
  const [aiInput, setAiInput] = useState("");

  const text = t();
  const locale = getLocale();

  const [aiMessages, setAiMessages] = useState([
    {
      role: "ai",
      text: text.writeGoalAi,
    },
  ]);

  const [tasksByHabitDate, setTasksByHabitDate] = useState(() => {
    return readStoredJson("tasksByHabitDate", {});
  });

  useEffect(() => {
    setAiMessages([{ role: "ai", text: text.writeGoalAi }]);
  }, [text.writeGoalAi]);

  useEffect(() => {
    const loadHabits = () => {
      const savedHabits = readStoredJson("createdHabits", []);
      const savedActiveId = localStorage.getItem("activeHabitId") || "";

      setHabits(savedHabits);

      if (savedHabits.length > 0) {
        const validHabit = savedHabits.find((habit) => habit.id === savedActiveId);

        if (validHabit) {
          setActiveHabitId(savedActiveId);
        } else {
          setActiveHabitId(savedHabits[0].id);
          localStorage.setItem("activeHabitId", savedHabits[0].id);
        }
      } else {
        setActiveHabitId("");
      }
    };

    loadHabits();

    window.addEventListener("habitsUpdated", loadHabits);
    window.addEventListener("tasksUpdated", loadHabits);

    return () => {
      window.removeEventListener("habitsUpdated", loadHabits);
      window.removeEventListener("tasksUpdated", loadHabits);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("tasksByHabitDate", JSON.stringify(tasksByHabitDate));
  }, [tasksByHabitDate]);

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isSameDate = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const selectedKey = getDateKey(selectedDate);
  const activeHabit = habits.find((habit) => habit.id === activeHabitId) || null;

  const tasks = ((tasksByHabitDate[activeHabitId] || {})[selectedKey] || []).slice()
    .sort((a, b) => {
      const aTime = a.startTime || "";
      const bTime = b.startTime || "";
      return aTime.localeCompare(bTime);
    });

  const monthLabel = currentDate.toLocaleString(locale, {
    month: "long",
    year: "numeric",
  });

  const daysOfWeek = useMemo(() => {
    const start = new Date(2026, 0, 4);
    return Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
      )
    );
  }, [locale]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startWeekDay = firstDayOfMonth.getDay();
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days = [];

    for (let i = startWeekDay - 1; i >= 0; i -= 1) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        currentMonth: false,
      });
    }

    for (let day = 1; day <= totalDaysInMonth; day += 1) {
      days.push({
        date: new Date(year, month, day),
        currentMonth: true,
      });
    }

    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day += 1) {
      days.push({
        date: new Date(year, month + 1, day),
        currentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);

    if (
      date.getMonth() !== currentDate.getMonth() ||
      date.getFullYear() !== currentDate.getFullYear()
    ) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const handleSelectHabit = (e) => {
    const id = e.target.value;
    setActiveHabitId(id);
    localStorage.setItem("activeHabitId", id);
    window.dispatchEvent(new Event("habitsUpdated"));
  };

  const handleAddTask = () => {
    if (!activeHabitId) {
      alert(text.firstCreateGoal);
      return;
    }

    if (!activeHabit) {
      alert(text.noActiveGoal);
      return;
    }

    if (!inputValue.trim() || !taskStartTime || !taskEndTime) {
      alert(text.fillTaskAndTime);
      return;
    }

    if (taskEndTime <= taskStartTime) {
      alert(text.endTimeLater);
      return;
    }

    if (selectedKey < activeHabit.startDate || selectedKey > activeHabit.endDate) {
      alert(text.taskDateInsideGoal);
      return;
    }

    const newTask = {
      id: Date.now(),
      text: inputValue.trim(),
      date: selectedKey,
      startTime: taskStartTime,
      endTime: taskEndTime,
      xp: 100,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasksByHabitDate = {
      ...tasksByHabitDate,
      [activeHabitId]: {
        ...(tasksByHabitDate[activeHabitId] || {}),
        [selectedKey]: [
          ...((tasksByHabitDate[activeHabitId] || {})[selectedKey] || []),
          newTask,
        ],
      },
    };

    setTasksByHabitDate(updatedTasksByHabitDate);
    localStorage.setItem("tasksByHabitDate", JSON.stringify(updatedTasksByHabitDate));
    window.dispatchEvent(new Event("tasksUpdated"));
    window.dispatchEvent(new Event("habitsUpdated"));
    setInputValue("");
    setTaskStartTime("");
    setTaskEndTime("");
  };

  const handleGenerateAi = () => {
    if (!activeHabitId) {
      alert(text.firstCreateGoal);
      return;
    }

    if (!activeHabit) {
      alert(text.noActiveGoal);
      return;
    }

    if (!aiInput.trim()) return;

    if (selectedKey < activeHabit.startDate || selectedKey > activeHabit.endDate) {
      alert(text.taskDateInsideGoal);
      return;
    }

    const userMessage = { role: "user", text: aiInput };
    const aiMessage = { role: "ai", text: `${text.aiGeneratedForDay} ${selectedKey}.` };

    const generatedTasks = [
      {
        id: Date.now() + 1,
        text: text.warmUpSession,
        date: selectedKey,
        startTime: "08:00",
        endTime: "08:30",
        xp: 100,
        completed: false,
      },
      {
        id: Date.now() + 2,
        text: text.mainExerciseBlock,
        date: selectedKey,
        startTime: "09:00",
        endTime: "10:00",
        xp: 100,
        completed: false,
      },
      {
        id: Date.now() + 3,
        text: text.stretching,
        date: selectedKey,
        startTime: "10:15",
        endTime: "10:30",
        xp: 100,
        completed: false,
      },
    ];

    const updatedTasksByHabitDate = {
      ...tasksByHabitDate,
      [activeHabitId]: {
        ...(tasksByHabitDate[activeHabitId] || {}),
        [selectedKey]: [
          ...((tasksByHabitDate[activeHabitId] || {})[selectedKey] || []),
          ...generatedTasks,
        ],
      },
    };

    setAiMessages((prev) => [...prev, userMessage, aiMessage]);
    setTasksByHabitDate(updatedTasksByHabitDate);
    localStorage.setItem("tasksByHabitDate", JSON.stringify(updatedTasksByHabitDate));
    window.dispatchEvent(new Event("tasksUpdated"));
    window.dispatchEvent(new Event("habitsUpdated"));
    setAiInput("");
  };

  const handleDeleteTask = (taskId) => {
    if (!window.confirm(text.deleteTaskConfirm)) {
      return;
    }

    const nextHabitTasks = { ...(tasksByHabitDate[activeHabitId] || {}) };
    const nextDayTasks = (nextHabitTasks[selectedKey] || []).filter(
      (task) => task.id !== taskId
    );

    if (nextDayTasks.length === 0) {
      delete nextHabitTasks[selectedKey];
    } else {
      nextHabitTasks[selectedKey] = nextDayTasks;
    }

    const nextTasksByHabitDate = { ...tasksByHabitDate };

    if (Object.keys(nextHabitTasks).length === 0) {
      delete nextTasksByHabitDate[activeHabitId];
    } else {
      nextTasksByHabitDate[activeHabitId] = nextHabitTasks;
    }

    setTasksByHabitDate(nextTasksByHabitDate);
    localStorage.setItem("tasksByHabitDate", JSON.stringify(nextTasksByHabitDate));
    window.dispatchEvent(new Event("tasksUpdated"));
    window.dispatchEvent(new Event("storage"));
  };

  if (!activeHabit) {
    return (
      <div className="dashboard-empty-card">
        <h3>{text.noActiveGoal}</h3>
        <p>{text.createGoalFirst}</p>
      </div>
    );
  }

  return (
    <div className="tasks-page-ui">
      <div className="tasks-header-top">
        <h2 className="tasks-title">{activeHabit.habitName}</h2>

        <select
          value={activeHabitId}
          onChange={handleSelectHabit}
          className="tasks-habit-select"
        >
          {habits.map((habit) => (
            <option key={habit.id} value={habit.id}>
              {habit.habitName}
            </option>
          ))}
        </select>
      </div>

      <div className="tasks-month-box full-calendar-header">
        <button
          type="button"
          className="tasks-month-arrow"
          onClick={handlePrevMonth}
        >
          {'<'}
        </button>

        <span>{monthLabel}</span>

        <button
          type="button"
          className="tasks-month-arrow"
          onClick={handleNextMonth}
        >
          {'>'}
        </button>
      </div>

      <div className="month-calendar-wrap">
        <div className="calendar-weekdays">
          {daysOfWeek.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map(({ date, currentMonth }) => {
            const isSelected = isSameDate(date, selectedDate);
            const hasTasks =
              ((tasksByHabitDate[activeHabitId] || {})[getDateKey(date)] || []).length > 0;

            return (
              <button
                key={`${activeHabitId}-${getDateKey(date)}`}
                type="button"
                className={`calendar-day-cell ${currentMonth ? "current-month" : "other-month"} ${isSelected ? "selected-day" : ""}`}
                onClick={() => handleDayClick(date)}
              >
                <span className="calendar-day-number">{date.getDate()}</span>
                {hasTasks && <span className="calendar-task-dot"></span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="selected-date-label">{text.selectedDate}: {selectedKey}</div>

      <div className="tasks-main-layout">
        <div className="tasks-left-column">
          <div className="tasks-list-box">
            {tasks.length === 0 ? (
              <div className="dashboard-no-tasks">{text.noTasksForDate}</div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="task-row-card">
                  <div className="task-row-main">
                    <div className="task-check empty-box"></div>

                    <div className="task-info-block">
                      <p className="task-name">{task.text}</p>
                      <span className="task-time-label">
                        {task.startTime} - {task.endTime}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="task-delete-btn task-delete-btn-soft"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    {text.delete}
                  </button>
                </div>
              ))
            )}

            <div className="task-add-form">
              <div className="task-add-top">
                <div className="task-check empty-box"></div>

                <input
                  type="text"
                  placeholder={text.writeTask}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="task-write-input"
                />
              </div>

              <div className="task-time-row">
                <span>{text.chooseTime}</span>

                <input
                  type="time"
                  value={taskStartTime}
                  onChange={(e) => setTaskStartTime(e.target.value)}
                  className="task-time-input"
                />

                <input
                  type="time"
                  value={taskEndTime}
                  onChange={(e) => setTaskEndTime(e.target.value)}
                  className="task-time-input"
                />

                <button
                  type="button"
                  className="task-add-submit-btn"
                  onClick={handleAddTask}
                >
                  {text.addTask}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="tasks-ai-box">
          <div className="tasks-ai-messages">
            {aiMessages.map((message, index) => (
              <div
                key={index}
                className={`tasks-ai-message ${message.role === "user" ? "user" : "ai"}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="tasks-ai-bottom">
            <div className="tasks-ai-actions-left">
              <button type="button">+</button>
              <button type="button">[]</button>
              <button type="button">*</button>
            </div>

            <input
              type="text"
              placeholder={text.writeYourGoal}
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="tasks-ai-input"
              onKeyDown={(e) => e.key === "Enter" && handleGenerateAi()}
            />

            <button
              type="button"
              className="tasks-ai-generate-btn"
              onClick={handleGenerateAi}
            >
              {text.generateWithAi}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
