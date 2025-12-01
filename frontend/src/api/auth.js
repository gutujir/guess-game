import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

export const loginApi = (data) => API.post("/auth/login", data);
export const registerApi = (data) => API.post("/auth/signup", data);
export const logoutApi = () => API.post("/auth/logout");
export const checkAuthApi = () => API.get("/auth/check-auth");
