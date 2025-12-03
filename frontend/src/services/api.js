import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL,
  withCredentials: true // send/receive cookies (token is stored in httpOnly cookie by backend)
});

export default api;

/* Helper wrappers (optional) */
export const registerCandidate = async (data) => {
  return api.post("/api/v1/candidates/register", data);
};

export const registerTeacher = async (data) => {
  return api.post("/api/v1/teachers/register", data);
};
