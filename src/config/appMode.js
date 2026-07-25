export const detectAppMode = () => {
  if (typeof window === "undefined") return "customer";

  const hostname = window.location.hostname;

  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";

  if (isLocalhost) return "local";

  const urlMode = new URLSearchParams(window.location.search).get("appMode");
  if (urlMode === "local" || urlMode === "customer") return urlMode;

  return "customer";
};

export const APP_MODE = detectAppMode();
export const isLocalMode = APP_MODE === "local";
export const isCustomerMode = APP_MODE === "customer";
