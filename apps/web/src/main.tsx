import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./app/App";
import { isMaintenanceMode } from "./config/runtime";
import { disableServiceWorkerForMaintenance, registerServiceWorker } from "./services/serviceWorkerRegistration";
import "./styles/index.css";

// Register the PWA service worker only when the app is open to users.
if (isMaintenanceMode) {
  void disableServiceWorkerForMaintenance();
} else {
  registerServiceWorker();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
