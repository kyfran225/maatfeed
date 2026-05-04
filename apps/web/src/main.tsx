import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./app/App";
import { registerServiceWorker } from "./services/serviceWorkerRegistration";
import "./styles/index.css";

// Register Service Worker for PWA functionality
registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
