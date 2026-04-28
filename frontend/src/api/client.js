import axios from "axios";

const isBrowser = typeof window !== "undefined";
const localHosts = new Set(["localhost", "127.0.0.1"]);
const isLocalDev = isBrowser && localHosts.has(window.location.hostname);

const baseURL =
  import.meta.env.VITE_API_URL ||
  (isLocalDev ? "http://localhost:8000/api" : "/_/backend/api");

const client = axios.create({
  baseURL,
  timeout: 20000,
});

export default client;
