// routes/candidateRouter.js
import express from "express";
import {
  registerCandidate,
  loginCandidate,
  getProfile,
  getExamByKey,
  submitExam,
  getSubmissionById,
} from "../controllers/candidateCtrl.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/api/v1/candidates/register", registerCandidate);
router.post("/api/v1/candidates/login", loginCandidate);
router.get("/api/v1/candidates/profile", isAuth, getProfile);
router.get("/api/v1/candidates/exam/:examKey", isAuth, getExamByKey);
router.post("/api/v1/candidates/submit-exam", isAuth, submitExam);
router.get("/api/v1/candidates/submissions/:id", isAuth, getSubmissionById);

export default router;
