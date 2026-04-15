import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import IntroAnimation from "./components/IntroAnimation/IntroAnimation";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Welcome from "./pages/Welcome";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import CharacterSelect from "./pages/CharacterSelect";
import { applyTheme, getAppSettings } from "./utils/appSettings";

function RequireAuth({ children }) {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const updateTheme = () => {
      const savedSettings = getAppSettings();
      applyTheme(savedSettings.theme || "light");
    };

    updateTheme();
    window.addEventListener("storage", updateTheme);

    return () => {
      window.removeEventListener("storage", updateTheme);
    };
  }, []);

  if (showIntro) {
    return <IntroAnimation onFinish={() => setShowIntro(false)} />;
  }

  return (
    <Router>
      <>
        <ToastContainer position="top-right" autoClose={2500} />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/welcome"
            element={
              <RequireAuth>
                <Welcome />
              </RequireAuth>
            }
          />
          <Route
            path="/profile-setup"
            element={
              <RequireAuth>
                <ProfileSetup />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/character"
            element={
              <RequireAuth>
                <CharacterSelect />
              </RequireAuth>
            }
          />
        </Routes>
      </>
    </Router>
  );
}
