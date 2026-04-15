import "./AppSettings.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { applyTheme, getAppSettings, translations } from "../utils/appSettings";

export default function AppSettings() {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const savedSettings = getAppSettings();
    setTheme(savedSettings.theme || "light");
    setLanguage(savedSettings.language || "en");
    setNotifications(
      typeof savedSettings.notifications === "boolean"
        ? savedSettings.notifications
        : true
    );
  }, []);

  const text = translations[language] || translations.en;

  const handleSave = () => {
    const settingsData = {
      theme,
      language,
      notifications,
    };

    localStorage.setItem("appSettings", JSON.stringify(settingsData));
    applyTheme(theme);
    window.dispatchEvent(new Event("storage"));
    toast.success(text.settingsSaved);
  };

  return (
    <div className="app-settings-page">
      <div className="app-settings-card">
        <h2 className="app-settings-title">{text.appSettings}</h2>

        <div className="setting-row">
          <div>
            <h4>{text.theme}</h4>
            <p>{text.chooseAppearance}</p>
          </div>

          <div className="theme-buttons">
            <button
              className={theme === "light" ? "theme-btn active-theme" : "theme-btn"}
              onClick={() => setTheme("light")}
              type="button"
            >
              {text.light}
            </button>

            <button
              className={theme === "dark" ? "theme-btn active-theme" : "theme-btn"}
              onClick={() => setTheme("dark")}
              type="button"
            >
              {text.dark}
            </button>
          </div>
        </div>

        <div className="setting-row">
          <div>
            <h4>{text.language}</h4>
            <p>{text.selectLanguage}</p>
          </div>

          <select
            className="settings-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="kz">Қазақша</option>
          </select>
        </div>

        <div className="setting-row">
          <div>
            <h4>{text.notifications}</h4>
            <p>{text.enableNotifications}</p>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <button className="save-settings-btn" onClick={handleSave} type="button">
          {text.saveSettings}
        </button>
      </div>
    </div>
  );
}
