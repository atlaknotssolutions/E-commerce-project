import axios from "axios";

export const API_URL = "https://e-commerce-project-1-sb2k.onrender.com";

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
