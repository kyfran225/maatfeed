import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./app/App";
import { isMaintenanceMode } from "./config/runtime";
import { registerServiceWorker, unregister } from "./services/serviceWorkerRegistration";
import "./styles/index.css";

if (isMaintenanceMode) {
  unregister();
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
