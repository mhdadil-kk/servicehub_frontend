export const API_BASE_URL = import.meta.env.PROD
  ? "https://api.servicehub.adilkk.in/api"
  : "http://localhost:5000/api";

export const API_ORIGIN = import.meta.env.PROD
  ? "https://api.servicehub.adilkk.in"
  : "http://localhost:5000";