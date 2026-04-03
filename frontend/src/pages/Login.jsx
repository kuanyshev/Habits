import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";
import google from "../assets/google.png";
import {
  loginRequest,
  registerRequest,
  clearAuth,
  clearHabitKeysIfUserSwitched,
} from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const persistSession = (data) => {
    if (data.user?.id != null) {
      clearHabitKeysIfUserSwitched(data.user.id);
    }
    if (data.access) localStorage.setItem("accessToken", data.access);
    if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
    if (data.user?.username) {
      localStorage.setItem("userName", data.user.username);
    }
    if (data.user?.id != null) {
      localStorage.setItem("userId", String(data.user.id));
    }
  };

  const postAuthNavigate = (user) => {
    if (user?.onboarding_completed) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/welcome", { replace: true });
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!password) {
      setError("Enter your password.");
      return;
    }
    if (isLogin) {
      if (!username.trim()) {
        setError("Enter your username.");
        return;
      }
      setLoading(true);
      try {
        const data = await loginRequest(username.trim(), password);
        persistSession(data);
        postAuthNavigate(data.user);
      } catch (e) {
        setError(e.message || "Login failed.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!username.trim()) {
      setError("Choose a username.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      clearAuth();
      await registerRequest({
        username: username.trim(),
        email: (email || "").trim(),
        password,
      });
      const data = await loginRequest(username.trim(), password);
      persistSession(data);
      postAuthNavigate(data.user);
    } catch (e) {
      setError(e.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <img src={logo} alt="SCOPOS" className="auth-logo-img" />

        {!isLogin && (
          <>
            <button className="google-btn" type="button" disabled>
              <img src={google} alt="Google" className="google-icon-img" />
              Continue via Google
            </button>

            <div className="divider">
              <span>or</span>
            </div>
          </>
        )}

        <div className="auth-form">
          <input
            className="auth-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          {!isLogin && (
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          )}

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          {!isLogin && (
            <input
              className="auth-input"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          )}

          {isLogin && (
            <div className="forgot-row">
              <span>Forgot a password?</span>
            </div>
          )}

          {error ? (
            <p style={{ color: "#c44", fontSize: "0.9rem", margin: 0 }}>
              {error}
            </p>
          ) : null}

          <button
            type="button"
            className="submit-btn"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "…" : isLogin ? "Log in" : "Create account"}
          </button>
        </div>

        <p className="bottom-text">
          {isLogin
            ? "Don't have a SCOPOS account?"
            : "Already have a SCOPOS account?"}{" "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Register" : "Log in"}
          </span>
        </p>
      </div>
    </div>
  );
}
