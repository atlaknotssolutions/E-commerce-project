import axios from "axios";
import { notification } from "../services/notificationService";

// export const API_URL = "https://e-commerce-project-1-sb2k.onrender.com";
// export const API_URL = "http://localhost:5000";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : window.location.hostname === "192.168.1.22"
      ? "http://192.168.1.22:5000"
      : "https://e-commerce-project-1-sb2k.onrender.com";

export { API_URL };

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});





api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Public / auth endpoints where a 401 is an expected validation result
// (e.g. wrong OTP) and must NOT trigger a session-expiry redirect.
const AUTH_EXEMPT_PATHS = [
  "/auth/sent/login-signup-otp",
  "/auth/signin",
  "/auth/signup",
  "/sellers/sent/login-top",
  "/sellers/verify/login-top",
  "/sellers/password-login",
  "/sellers/password",
  "/sellers/reset-password-request",
  "/sellers/reset-password",
  "/auth/password-login",
  "/auth/password",
  "/auth/reset-password-request",
  "/auth/reset-password",
];

let redirectingToLogin = false;

const isAuthExempt = (url: string | undefined) =>
  !!url && AUTH_EXEMPT_PATHS.some((path) => url.includes(path));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string | undefined = error.config?.url;

    if (
      status === 401 &&
      !isAuthExempt(url) &&
      !redirectingToLogin &&
      localStorage.getItem("jwt")
    ) {
      redirectingToLogin = true;
      localStorage.removeItem("jwt");
      notification.warning("Your session has expired. Please login again.");

      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.assign("/login");
        }, 100);
      }
    }

    return Promise.reject(error);
  },
);

// import axios from 'axios';

// export const API_URL = "http://localhost:5000";
// // export const DEPLOYED_URL = "https://zosh-bazzar-backend.onrender.com"
// // change api

// export const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
