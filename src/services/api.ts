import axios from "axios";

const api = axios.create({
  baseURL: "http://api.rentus/api", // tu endpoint Laravel
  // withCredentials: true, // si usas Sanctum o cookies
});

export default api;
