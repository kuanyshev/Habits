import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";
import { GoogleLogin } from "@react-oauth/google";
import {
  loginRequest,
  registerRequest,
  googleLoginRequest,
  setPasswordRequest,
  clearAuth,
  clearHabitKeysIfUserSwitched,
} from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const [googleUserForContinue, setGoogleUserForContinue] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState({});

  const persistSession = (data) => {
    if (data.user?.id != null) {
      clearHabitKeysIfUserSwitched(data.user.id);
    }
    if (data.access) localStorage.setItem("accessToken", data.access);
    if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
    const displayName = data.user?.nickname || data.user?.username;
    if (displayName) {
      localStorage.setItem("userName", displayName);
    }
    if (data.user?.id != null) {
      localStorage.setItem("userId", String(data.user.id));
    }
    if (data.user && typeof data.user === "object") {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  };

  const postAuthNavigate = (user) => {
    if (user?.onboarding_completed) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/welcome", { replace: true });
    }
  };

  const validateRegister = () => {
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
        newErrors.password =
          "Password must contain at least one uppercase letter";
      }
    }
    if (!username.trim()) {
      newErrors.username = "Nickname is required";
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    if (!password) {
      setError("Enter your password.");
      toast.error("Enter your password.");
      return;
    }
    if (isLogin) {
      if (!loginEmail.trim()) {
        setError("Enter your email.");
        toast.error("Enter your email.");
        return;
      }
      setLoading(true);
      try {
        const data = await loginRequest(loginEmail.trim(), password);
        persistSession(data);
        toast.success("Login successful");
        postAuthNavigate(data.user);
      } catch (e) {
        const msg = e.message || "Login failed.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!validateRegister()) return;

    setLoading(true);
    try {
      clearAuth();
      await registerRequest({
        nickname: username.trim(),
        email: (email || "").trim(),
        password,
      });
      const data = await loginRequest((email || "").trim(), password);
      persistSession(data);
      toast.success("Account created");
      postAuthNavigate(data.user);
    } catch (e) {
      const msg = e.message || "Registration failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await setPasswordRequest(newPassword);
      setNeedsPasswordSetup(false);
      toast.success("Password saved");
      postAuthNavigate(googleUserForContinue);
    } catch (e) {
      const msg = e.message || "Failed to save password.";
      setError(msg);
      toast.error(msg);
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
            <div className="google-btn" style={{ padding: 0 }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    setLoading(true);
                    setError("");
                    clearAuth();
                    const cred = credentialResponse?.credential;
                    if (!cred) throw new Error("Missing Google credential.");
                    const data = await googleLoginRequest(cred, {
                      username: username.trim(),
                      password,
                    });
                    persistSession(data);
                    if (data.user?.has_password) {
                      toast.success("Signed in with Google");
                      postAuthNavigate(data.user);
                    } else {
                      setGoogleUserForContinue(data.user || null);
                      setNeedsPasswordSetup(true);
                    }
                  } catch (e) {
                    const msg = e.message || "Google login failed.";
                    setError(msg);
                    toast.error(msg);
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  setError("Google login failed.");
                  toast.error("Google login failed.");
                }}
                useOneTap={false}
              />
            </div>

            <div className="divider">
              <span>or</span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#666", margin: "6px 0 0" }}>
              Want to log in later without Google? Fill username + password first.
            </p>
          </>
        )}

        <div className="auth-form">
          <input
            className={`auth-input ${!isLogin && errors.username ? "input-error" : ""}`}
            type={isLogin ? "email" : "text"}
            placeholder={isLogin ? "Email" : "Nickname"}
            value={isLogin ? loginEmail : username}
            onChange={(e) =>
              isLogin ? setLoginEmail(e.target.value) : setUsername(e.target.value)
            }
            autoComplete={isLogin ? "email" : "username"}
          />
          {!isLogin && errors.username && (
            <p className="error-text">{errors.username}</p>
          )}

          {!isLogin && (
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
                autoComplete="email"
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </>
          )}

          <input
            className={`auth-input ${!isLogin && errors.password ? "input-error" : ""}`}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          {!isLogin && errors.password && (
            <p className="error-text">{errors.password}</p>
          )}

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
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="error-text">{errors.confirmPassword}</p>
              )}
            </>
          )}

          {needsPasswordSetup && (
            <>
              <input
                className="auth-input"
                type="password"
                placeholder="Set password for future login"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <input
                className="auth-input"
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="submit-btn"
                disabled={loading}
                onClick={handleSavePassword}
              >
                {loading ? "…" : "Save password and continue"}
              </button>
            </>
          )}

          {isLogin && (
            <div className="forgot-row">
              <span onClick={() => navigate("/forgot-password")}>
                Forgot your password?
              </span>
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
            disabled={loading || needsPasswordSetup}
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
              setErrors({});
            }}
          >
            {isLogin ? "Register" : "Log in"}
          </span>
        </p>
      </div>
    </div>
  );
}
