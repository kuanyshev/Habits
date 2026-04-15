import "./Welcome.css";
import { useNavigate } from "react-router-dom";
import mascot from "../assets/mascot.png";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-wrapper">
        <h1 className="welcome-title">
          Welcome to <span>SCOPOS!</span>
        </h1>

        <div className="welcome-main">
          <div className="welcome-card">
            <p>Hi! I’m Sparkle, your SCOPOS assistant.</p>

            <p>
              I’ll help you create habits, track your progress, and level up
              your journey step by step.
            </p>

            <p>
              Complete tasks, earn XP, and stay focused on your goals every
              day.
            </p>

            <p>Ready to start your journey?</p>
          </div>

          <div className="welcome-side">
            <img src={mascot} alt="Mascot" className="welcome-mascot" />

            <button
              className="welcome-btn"
              onClick={() => navigate("/profile-setup")}
            >
              Start
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