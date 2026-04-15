import "./Settings.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function Settings() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
    }
  }, []);

  const validate = () => {
    if (!name.trim()) return "Name is required";

    if (!email.includes("@")) return "Invalid email";

    if (!phone.startsWith("+7") || phone.length !== 12)
      return "Phone must be +7XXXXXXXXXX";

    return null;
  };

  const handleSave = () => {
    const error = validate();

    if (error) {
      toast.error(error);
      return;
    }

    const updatedUser = {
      username: name,
      email,
      phone,
      location,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    toast.success("Saved successfully");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="settings-page">
      <div className="settings-box">
        <h2>Settings</h2>

        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="+7XXXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">Select city</option>
          <option>Almaty</option>
          <option>Astana</option>
          <option>Shymkent</option>
          <option>Karaganda</option>
          <option>Aktobe</option>
        </select>

        <button className="save-btn" onClick={handleSave}>
          Save changes
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
}