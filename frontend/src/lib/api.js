import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sunya_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const formatNPR = (n) =>
  `NPR ${Math.round(n).toLocaleString("en-IN")}`;

export const formatGrams = (g) => (g >= 1000 ? `${g / 1000}kg` : `${g}g`);
