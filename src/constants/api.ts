export const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://localhost:5000/api";

export const API_ORIGIN = import.meta.env.PROD
  ? window.location.origin
  : "http://localhost:5000";