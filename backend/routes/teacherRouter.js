import express from "express";
import {
  registerTeacher,
  loginTeacher,
  getProfile,
  createExam,
  logoutTeacher,
  gradeSubmissionAI,
  gradeExamSubmissionsAI,
  gradeSubmissionManual,
  getExamSubmissions,
  getExamReports,
  getSubmissionReports,
} from "../controllers/teacherCtrl.js";
import isAuthenticated from "../middlewares/isAuth.js";

const router = express.Router();

// Public routes
router.post("/register", registerTeacher);
router.post("/login", loginTeacher);

// Private routes
router.get("/profile", isAuthenticated, getProfile);
router.post("/create-exam", isAuthenticated, createExam);
router.post("/submissions/:id/grade-ai", isAuthenticated, gradeSubmissionAI);
router.post("/exams/:examId/grade-ai", isAuthenticated, gradeExamSubmissionsAI);
router.post("/submissions/:id/grade-manual", isAuthenticated, gradeSubmissionManual);
router.get("/exams/:examId/submissions", isAuthenticated, getExamSubmissions);
router.get("/reports/exams", isAuthenticated, getExamReports);
router.get("/reports/submissions", isAuthenticated, getSubmissionReports);
router.post("/logout", isAuthenticated, logoutTeacher);

export default router;
