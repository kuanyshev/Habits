import "./Welcome.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import setupMascot from "../assets/setup-mascot.png";
import maleIcon from "../assets/male.png";
import femaleIcon from "../assets/female.png";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState("");
  const [birthDate, setBirthDate] = useState("");

  return (
    <div className="welcome-page">
      <div className="welcome-wrapper">
        <h1 className="welcome-title">
          Set up your <span>profile</span>
        </h1>

        <div className="welcome-main">
          <div className="profile-card">
            <label className="profile-label">Nickname</label>
            <input
              className="profile-input"
              type="text"
              placeholder="Enter your nickname"
            />

            <label className="profile-label">Gender</label>
            <div className="gender-options">
              <button
                type="button"
                className={`gender-card ${
                  selectedGender === "male" ? "active" : ""
                }`}
                onClick={() => setSelectedGender("male")}
              >
                <img src={maleIcon} alt="Male" className="gender-icon" />
                <span>Male</span>
              </button>

              <button
                type="button"
                className={`gender-card ${
                  selectedGender === "female" ? "active" : ""
                }`}
                onClick={() => setSelectedGender("female")}
              >
                <img src={femaleIcon} alt="Female" className="gender-icon" />
                <span>Female</span>
              </button>
            </div>

            <label className="profile-label">Date of birth</label>
            <input
              className="profile-input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div className="welcome-side">
            <img
              src={setupMascot}
              alt="Setup Mascot"
              className="welcome-mascot"
            />

            <button
              className="welcome-btn"
              onClick={() => navigate("/character")}
            >
              Continue
            </button>
          </div>
        </div>

        <div className="welcome-footer">
          <span>© 2026 SCOPOS. All rights reserved.</span>
          <span>Instagram Facebook</span>
          <span>Privacy policy / Terms of service</span>
        </div>
      </div>
    </div>
  );
}