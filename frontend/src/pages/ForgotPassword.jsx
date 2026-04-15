import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleReset = () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return;
    }

    setError("");
    toast.success("Reset link sent to your email");

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <img src={logo} alt="SCOPOS" className="auth-logo-img" />

        <div className="auth-form">
          <h2 style={{ textAlign: "center", color: "white", marginBottom: "10px" }}>
            Forgot Password
          </h2>

          <p style={{ textAlign: "center", color: "#aaa", marginBottom: "20px" }}>
            Enter your email and we will send you a reset link
          </p>

          <input
            className={`auth-input ${error ? "input-error" : ""}`}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="button" className="submit-btn" onClick={handleReset}>
            Send reset link
          </button>

          <p className="bottom-text">
            <span onClick={() => navigate("/")}>Back to login</span>
          </p>
        </div>
      </div>
    </div>
  );
}