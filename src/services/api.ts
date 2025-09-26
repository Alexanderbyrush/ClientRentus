import axios from "axios";

const api = axios.create({
  baseURL: "/api", // tu endpoint Laravel
  // withCredentials: true, // si usas Sanctum o cookies
});

export default api;
