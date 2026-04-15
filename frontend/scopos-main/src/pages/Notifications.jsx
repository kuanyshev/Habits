import { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Notifications({ onBack }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("communityNotifications")) || [];
    setNotifications(saved);
  }, []);

  const clearAll = () => {
    localStorage.setItem("communityNotifications", JSON.stringify([]));
    setNotifications([]);
  };

  return (
    <div className="notifications-page">
      <div className="publication-header">
        <button type="button" className="community-link-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Notifications</h2>
      </div>

      <div className="notifications-top-actions">
        <button type="button" className="community-secondary-btn" onClick={clearAll}>
          Clear all
        </button>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="community-empty-card">
            <h3>No notifications</h3>
            <p>Everything is quiet for now.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div key={item.id} className="notification-card">
              <p>{item.text}</p>
              <span>{new Date(item.date).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}