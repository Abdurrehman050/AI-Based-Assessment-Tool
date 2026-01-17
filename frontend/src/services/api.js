import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL,
  withCredentials: true, // send/receive cookies (JWT in httpOnly cookie)
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

/* ======================
   AUTH HELPERS
====================== */

export const registerCandidate = (data) =>
  api.post("/api/v1/candidates/register", data);

export const loginCandidate = (data) =>
  api.post("/api/v1/candidates/login", data);

export const registerTeacher = (data) =>
  api.post("/api/v1/teachers/register", data);

export const loginTeacher = (data) =>
  api.post("/api/v1/teachers/login", data);

export const logoutCandidate = () =>
  api.post("/api/v1/candidates/logout");

export const logoutTeacher = () =>
  api.post("/api/v1/teachers/logout");

/* ======================
   TEACHER — EXAMS
====================== */

export const createExam = (data) =>
  api.post("/api/v1/teachers/create-exam", data);

export const getExamSubmissions = (examId) =>
  api.get(`/api/v1/teachers/exams/${examId}/submissions`);

export const gradeExamAI = (examId) =>
  api.post(`/api/v1/teachers/exams/${examId}/grade-ai`);

export const gradeSubmissionAI = (submissionId) =>
  api.post(`/api/v1/teachers/submissions/${submissionId}/grade-ai`);

export const gradeSubmissionManual = (submissionId, data) =>
  api.post(`/api/v1/teachers/submissions/${submissionId}/grade-manual`, data);

export const getExamReports = () =>
  api.get("/api/v1/teachers/reports/exams");

export const getSubmissionReports = () =>
  api.get("/api/v1/teachers/reports/submissions");

/* ======================
   CANDIDATE — EXAMS
====================== */

export const getCandidateProfile = () =>
  api.get("/api/v1/candidates/profile");

export const getExamByKey = (examKey) =>
  api.get(`/api/v1/candidates/exam/${examKey}`);

export const submitExam = (data) =>
  api.post("/api/v1/candidates/submit-exam", data);

export const getSubmissionById = (id) =>
  api.get(`/api/v1/candidates/submissions/${id}`);
export const previewExam = (examId) => {
  if (!examId) throw new Error("Exam ID is required");
  return api.get(`/api/v1/teachers/exams/${examId}/preview`);
};
export const deleteExam = (examId) => api.delete(`/api/v1/teachers/exams/${examId}`);

/* ======================
   Admin
====================== */

export const getAllUsers = () => api.get("/api/v1/admin/users");
export const deleteUser = (role, id) =>
  api.delete(`/api/v1/admin/users/${role}/${id}`);
export const getAllExams = () => api.get("/api/v1/admin/exams");
