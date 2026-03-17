import axios from "axios";
import { clearToken, getToken } from "./auth";

const baseURL = (import.meta.env.VITE_API_BASE || "").trim() || "";

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Token is missing/invalid/expired
      clearToken();
    }
    return Promise.reject(err);
  }
);

