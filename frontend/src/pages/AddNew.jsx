import { useState } from "react";
import mascot from "../assets/mascot.png";
import "./Dashboard.css";
import {
  createHabitOnServer,
  habitStorageKey,
  mapServerHabitToLocal,
} from "../api";

export default function AddNew() {
  const [category, setCategory] = useState("");
  const [habitName, setHabitName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const categories = [
    "Fitness",
    "Learning",
    "Health",
    "Productivity",
    "Nutrition",
    "Creativity",
    "Mindfulness",
    "Social",
    "Sport",
    "Education",
    "Reading",
    "Sleep",
    "Meditation",
    "Water",
  ];

  const resetForm = () => {
    setCategory("");
    setHabitName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
  };

  const handleCreate = async () => {
    if (!category || !habitName.trim() || !startDate || !endDate) {
      alert("Please fill all required fields");
      return;
    }

    let newHabit = {
      id: Date.now().toString(),
      category,
      habitName: habitName.trim(),
      description: description.trim(),
      startDate,
      endDate,
      xp: 0,
      xpMax: 1000,
      level: 1,
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    if (localStorage.getItem("accessToken")) {
      try {
        const server = await createHabitOnServer({
          habitName: newHabit.habitName,
          description: newHabit.description,
          category: newHabit.category,
          start_date: newHabit.startDate,
          end_date: newHabit.endDate,
          xp: 0,
          xp_max: 1000,
          level: 1,
          status: "Active",
        });
        newHabit = { ...newHabit, ...mapServerHabitToLocal(server) };
      } catch (e) {
        console.warn(e);
        alert(
          "Could not save the goal on the server. It was saved locally only."
        );
      }
    }

    const savedHabits =
      JSON.parse(localStorage.getItem(habitStorageKey("createdHabits"))) || [];
    const updatedHabits = [...savedHabits, newHabit];

    localStorage.setItem(
      habitStorageKey("createdHabits"),
      JSON.stringify(updatedHabits)
    );
    localStorage.setItem(habitStorageKey("activeHabitId"), newHabit.id);
    window.dispatchEvent(new Event("habitsUpdated"));

    alert("Goal created successfully!");
    resetForm();
  };
  return (
    <div className="habit-card">
      <h2 className="habit-title">Create new target</h2>

      <p className="habit-subtitle">
        Build a goal, set a deadline and complete tasks to level up.
      </p>

      <div className="form-group">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Choose category</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Habit name</label>
        <input
          type="text"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
        />
      </div>

      <div className="form-group description-group">
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Define your own period</label>

        <div className="period-row">
          <div className="date-period-box">
            <div className="date-box">
              <span>Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="date-box">
              <span>End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="tip-card">
            <p>
              On average, it takes 66 days to develop a habit, not the commonly
              believed 21.
            </p>
            <p>
              The actual time frame depends on the complexity of the action and
              the individual.
            </p>
          </div>

          <img src={mascot} alt="Mascot" className="period-mascot" />
        </div>
      </div>

      <div className="actions">
        <button className="cancel-btn" type="button" onClick={resetForm}>
          Cancel
        </button>
        <button className="create-btn" type="button" onClick={handleCreate}>
          Create
        </button>
      </div>
    </div>
  );
}