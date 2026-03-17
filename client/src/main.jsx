import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";

// Production: point axios calls to API subdomain (e.g. https://api.yourdomain.com)
axios.defaults.baseURL = (import.meta.env.VITE_API_BASE || "").trim() || "";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
