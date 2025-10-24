// services/api.ts
import axios from "axios";

// API de tu backend Laravel
const api = axios.create({
  baseURL: "http://api.rentus/api",
});

// API de Google Maps (para autocompletado de ubicaciones)
const googleApi = axios.create({
  baseURL: "https://maps.googleapis.com/maps/api",
  timeout: 10000 // 10 segundos timeout
});

export { api, googleApi };
export default api;