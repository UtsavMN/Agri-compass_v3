const BACKEND_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const startKeepAlive = () => {
  // Ping immediately on app load
  fetch(`${BACKEND_URL}/api/health`).catch(() => {});

  // Then every 10 minutes
  setInterval(() => {
    fetch(`${BACKEND_URL}/api/health`).catch(() => {});
  }, 10 * 60 * 1000);
};
