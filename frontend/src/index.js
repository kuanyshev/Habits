import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));
// Должен совпадать с GOOGLE_CLIENT_ID на бэкенде (Google Cloud → OAuth client ID Web).
// Переопредели через frontend/.env: REACT_APP_GOOGLE_CLIENT_ID=....apps.googleusercontent.com
const defaultGoogleClientId =
  "228109311943-20j9dqn4v0h79eqcejtkcc8l22jdqm2v.apps.googleusercontent.com";
const clientId =
  process.env.REACT_APP_GOOGLE_CLIENT_ID || defaultGoogleClientId;

root.render(
  <GoogleOAuthProvider clientId={clientId}>
    <App />
  </GoogleOAuthProvider>
);