import axios from "axios";

const hasNavigator = typeof navigator !== "undefined";

/**
 * HYBRID LOGIC (simple + bulletproof):
 *
 * 1. PROD on Render → use Render URL
 * 2. Same-origin local hosting (Express serves dist + API on same host/port)
 * 3. Dev/LAN/Vite → use the same hostname as the frontend, port 5000 for backend
 * 4. Explicit override via VITE_API_URL
 */

const getBaseApiUrl = () => {
  const explicit = import.meta.env.VITE_API_URL;
  if (explicit) return explicit;

  if (typeof window === "undefined") {
    return "http://localhost:5000/api";
  }

  const hostname = window.location.hostname;

  if (import.meta.env.PROD) {
    if (
      hostname === "haleem-medicose-backend.onrender.com" ||
      hostname.endsWith(".onrender.com")
    ) {
      return "https://haleem-medicose-backend.onrender.com/api";
    }

    const port = window.location.port;
    const protocol = window.location.protocol;
    const base = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
    return `${base}/api`;
  }

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    return "http://localhost:5000/api";
  }

  return `http://${hostname}:5000/api`;
};

const API_URL = getBaseApiUrl();

export { API_URL, getBaseApiUrl };

console.log("🌍 MODE:", import.meta.env.MODE);
console.log("🔗 API:", API_URL);

/** Optional token getter */
function getStoredToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch (e) {
    return null;
  }
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===============================
   REQUEST LOGGER + AUTH HEADER
================================= */
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

/* ===============================
   RESPONSE LOGGER
================================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const cfg = error.config || {};
    const finalUrl = `${cfg.baseURL}${cfg.url}`;

    console.error("❌ API ERROR", {
      url: finalUrl,
      method: cfg.method?.toUpperCase(),
      message: error.message,
      code: error.code,
      status: error.response?.status,
      online: hasNavigator ? navigator.onLine : "unknown",
    });

    // Extra info on mobile networks
    if (hasNavigator && navigator.connection) {
      console.log("📶 Network:", {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
