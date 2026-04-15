import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import IntroAnimation from "./components/IntroAnimation/IntroAnimation";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/DashboardPage";
import CharacterSelect from "./pages/CharacterSelect";
import ForgotPassword from "./pages/ForgotPassword";
import { applyTheme, getAppSettings } from "./utils/appSettings";

function App() {
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
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/character" element={<CharacterSelect />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;