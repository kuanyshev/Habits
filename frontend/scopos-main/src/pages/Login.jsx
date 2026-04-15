import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";
import google from "../assets/google.png";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else {
      if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = "Password must contain at least one uppercase letter";
      }
    }

    if (!isLogin) {
      if (!username.trim()) {
        newErrors.username = "Username is required";
      }

      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const userData = {
      username: username || email.split("@")[0],
      email,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuth", "true");

    toast.success(isLogin ? "Login successful" : "Account created");

    setTimeout(() => {
      navigate("/welcome");
    }, 700);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <img src={logo} alt="SCOPOS" className="auth-logo-img" />

        {!isLogin && (
          <>
            <button className="google-btn" type="button">
              <img src={google} alt="Google" className="google-icon-img" />
              Continue via Google
            </button>

            <div className="divider">
              <span>or</span>
            </div>
          </>
        )}

        <div className="auth-form">
          {!isLogin && (
            <>
              <input
                className={`auth-input ${errors.username ? "input-error" : ""}`}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors((prev) => ({ ...prev, username: "" }));
                }}
              />
              {errors.username && <p className="error-text">{errors.username}</p>}
            </>
          )}

          <>
            <input
              className={`auth-input ${errors.email ? "input-error" : ""}`}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </>

          <>
            <input
              className={`auth-input ${errors.password ? "input-error" : ""}`}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </>

          {!isLogin && (
            <>
              <input
                className={`auth-input ${errors.confirmPassword ? "input-error" : ""}`}
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
              />
              {errors.confirmPassword && (
                <p className="error-text">{errors.confirmPassword}</p>
              )}
            </>
          )}

          {isLogin && (
            <div className="forgot-row">
              <span onClick={() => navigate("/forgot-password")}>
                Forgot your password?
              </span>
            </div>
          )}

          <button type="button" className="submit-btn" onClick={handleSubmit}>
            {isLogin ? "Log in" : "Create account"}
          </button>
        </div>

        <p className="bottom-text">
          {isLogin
            ? "Don't have a SCOPOS account?"
            : "Already have a SCOPOS account?"}{" "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setUsername("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            {isLogin ? "Register" : "Log in"}
          </span>
        </p>
      </div>
    </div>
  );
}