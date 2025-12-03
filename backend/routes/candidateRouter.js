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

router.post("/register", registerCandidate);
router.post("/login", loginCandidate);
router.get("/profile", isAuth, getProfile);
router.get("/exam/:examKey", isAuth, getExamByKey);
router.post("/submit-exam", isAuth, submitExam);
router.get("/submissions/:id", isAuth, getSubmissionById);

export default router;
