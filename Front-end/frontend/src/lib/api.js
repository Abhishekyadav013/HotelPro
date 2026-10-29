import axios from "axios";

export const SESSION_KEY = "hotelpro.session";
export const AUTH_EXPIRED_EVENT = "hotelpro:auth-expired";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
});

export function readSession() {
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const session = JSON.parse(value);
    return typeof session?.token === "string" && session.user?.name
      ? session
      : null;
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

api.interceptors.request.use((config) => {
  const session = readSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      window.sessionStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
    if (!error.response) {
      return "Could not reach the HotelPro API. Check that the backend is running and VITE_API_URL points to it.";
    }
  }
  return error instanceof Error ? error.message : fallback;
}

export { api };
