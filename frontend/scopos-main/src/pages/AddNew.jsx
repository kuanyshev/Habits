import { useState } from "react";
import mascot from "../assets/mascot.png";
import "./Dashboard.css";
import { t } from "../utils/appSettings";

export default function AddNew() {
  const [category, setCategory] = useState("");
  const [habitName, setHabitName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const text = t();

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

  const handleCreate = () => {
    if (!category || !habitName.trim() || !startDate || !endDate) {
      alert(text.fillRequiredFields);
      return;
    }

    const newHabit = {
      id: Date.now().toString(),
      category,
      habitName: habitName.trim(),
      description: description.trim(),
      startDate,
      endDate,
      xp: 0,
      xpMax: 1000,
      level: 1,
      status: text.activeStatus,
      createdAt: new Date().toISOString(),
    };

    const savedHabits = JSON.parse(localStorage.getItem("createdHabits")) || [];
    const updatedHabits = [...savedHabits, newHabit];

    localStorage.setItem("createdHabits", JSON.stringify(updatedHabits));
    localStorage.setItem("activeHabitId", newHabit.id);
    window.dispatchEvent(new Event("habitsUpdated"));
    alert(text.goalCreated);
    resetForm();
  };

  return (
    <div className="habit-card">
      <h2 className="habit-title">{text.createNewTarget}</h2>

      <p className="habit-subtitle">{text.buildGoalSubtitle}</p>

      <div className="form-group">
        <label>{text.category}</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">{text.chooseCategory}</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>{text.habitName}</label>
        <input
          type="text"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
        />
      </div>

      <div className="form-group description-group">
        <label>{text.description}</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>{text.definePeriod}</label>

        <div className="period-row">
          <div className="date-period-box">
            <div className="date-box">
              <span>{text.startDate}</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="date-box">
              <span>{text.endDate}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="tip-card">
            <p>{text.habitTip1}</p>
            <p>{text.habitTip2}</p>
          </div>

          <img src={mascot} alt="Mascot" className="period-mascot" />
        </div>
      </div>

      <div className="actions">
        <button className="cancel-btn" type="button" onClick={resetForm}>
          {text.cancel}
        </button>
        <button className="create-btn" type="button" onClick={handleCreate}>
          {text.create}
        </button>
      </div>
    </div>
  );
}
